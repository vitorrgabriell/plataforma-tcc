from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.models.user import User
from app.models.programa_finalidade import ProgramaFidelidade
from app.models.resgate_fidelidade import ResgateFidelidade
from app.models.pontos_fidelidade_cliente import PontosFidelidadeCliente
from app.schemas import ProgramaFidelidadeCreate, ProgramaFidelidadeResponse, ProgramaFidelidadeUpdate, ResgateFidelidadeCreate, ResgateFidelidadeResponse
from app.utils.dependencies import get_current_user
from app.utils.dynamo_client import listar_pontos_cliente

router = APIRouter()

@router.post("/programa", response_model=ProgramaFidelidadeResponse)
def criar_programa_fidelidade(programa: ProgramaFidelidadeCreate, db: Session = Depends(get_db)):
    novo_programa = ProgramaFidelidade(**programa.dict())
    db.add(novo_programa)
    db.commit()
    db.refresh(novo_programa)
    return novo_programa

@router.get("/programa", response_model=list[ProgramaFidelidadeResponse])
def listar_programas_fidelidade(db: Session = Depends(get_db)):
    programas = db.query(ProgramaFidelidade).all()
    return programas

@router.get("/meus-pontos")
def meus_pontos(user=Depends(get_current_user)):
    if user["tipo_usuario"] != "cliente":
        raise HTTPException(status_code=403, detail="Apenas clientes podem acessar seus pontos.")
    
    pontos = listar_pontos_cliente(cliente_id=user["id"])

    return pontos

@router.get("/meus-pontos/estabelecimentos")
def listar_pontos_por_estabelecimento(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user["tipo_usuario"] != "cliente":
        raise HTTPException(status_code=403, detail="Apenas clientes podem acessar seus pontos.")

    pontos = db.query(PontosFidelidadeCliente).options(
        joinedload(PontosFidelidadeCliente.estabelecimento)
    ).filter(PontosFidelidadeCliente.cliente_id == user["id"]).all()

    resultado = []
    for ponto in pontos:
        resultado.append({
            "estabelecimento_id": ponto.estabelecimento_id,
            "estabelecimento_nome": ponto.estabelecimento.nome if ponto.estabelecimento else "Desconhecido",
            "pontos_acumulados": ponto.pontos_acumulados
        })

    return resultado

@router.patch("/usuarios/{usuario_id}/acumular-ponto")
def acumular_ponto(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(User).filter(User.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if usuario.tipo_usuario != "cliente":
        raise HTTPException(status_code=400, detail="Somente clientes podem acumular pontos")
    
    usuario.pontos_acumulados += 1
    db.commit()
    return {"message": "Ponto acumulado com sucesso!"}

@router.post("/resgatar", response_model=ResgateFidelidadeResponse)
def resgatar_premio(resgate: ResgateFidelidadeCreate, db: Session = Depends(get_db)):
    cliente = db.query(User).filter(User.id == resgate.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    if cliente.tipo_usuario != "cliente":
        raise HTTPException(status_code=400, detail="Somente clientes podem resgatar prêmios")
    
    programa = db.query(ProgramaFidelidade).filter(ProgramaFidelidade.id == resgate.programa_fidelidade_id).first()
    if not programa:
        raise HTTPException(status_code=404, detail="Programa de fidelidade não encontrado")
    
    if cliente.pontos_acumulados < programa.pontos_necessarios:
        raise HTTPException(status_code=400, detail="Pontos insuficientes para resgatar o prêmio")
    
    cliente.pontos_acumulados -= programa.pontos_necessarios
    novo_resgate = ResgateFidelidade(cliente_id=cliente.id, programa_fidelidade_id=programa.id)
    db.add(novo_resgate)
    db.commit()
    db.refresh(novo_resgate)
    
    return novo_resgate

@router.patch("/programa/{programa_id}", response_model=ProgramaFidelidadeResponse)
def atualizar_programa_fidelidade(programa_id: int, dados: ProgramaFidelidadeUpdate, db: Session = Depends(get_db)):
    programa = db.query(ProgramaFidelidade).filter_by(id=programa_id).first()
    if not programa:
        raise HTTPException(status_code=404, detail="Programa não encontrado")

    for key, value in dados.dict().items():
        setattr(programa, key, value)

    db.commit()
    db.refresh(programa)
    return programa


@router.get("/resumo")
def resumo_fidelidade(estabelecimento_id: int, db: Session = Depends(get_db)):
    programa = db.query(ProgramaFidelidade).filter_by(estabelecimento_id=estabelecimento_id).first()

    if not programa:
        return {
            "ativo": False,
            "regra": "Programa não configurado",
            "participantes": 0,
            "servicosGratuitos": 0
        }

    total_participantes = db.execute("""
        SELECT COUNT(*) FROM usuarios 
        WHERE estabelecimento_id = :eid AND pontos_acumulados > 0
    """, {"eid": estabelecimento_id}).scalar()

    servicos_gratuitos = db.execute("""
    SELECT COUNT(*) 
    FROM resgates_fidelidade rf
    JOIN programa_fidelidade pf ON pf.id = rf.programa_fidelidade_id
    WHERE pf.estabelecimento_id = :eid
    """, {"eid": estabelecimento_id}).scalar()

    return {
        "ativo": programa.ativo,
        "regra": f"A cada {programa.pontos_necessarios} serviços pagos, {programa.descricao_premio}",
        "participantes": total_participantes,
        "servicosGratuitos": servicos_gratuitos
    }