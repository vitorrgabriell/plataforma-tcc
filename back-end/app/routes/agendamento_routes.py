from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.agendamento import Agendamento
from app.schemas import AgendamentoCreate, AgendamentoResponse, AgendamentoCanceladoResponse
from app.utils.dependencies import get_current_user
from datetime import datetime
from app.models.agenda_disponivel import AgendaDisponivel
from app.models.agendamento_cancelado import AgendamentoCancelado

router = APIRouter()

@router.post("/", response_model=AgendamentoResponse, status_code=status.HTTP_201_CREATED)
def criar_agendamento(
    agendamento: AgendamentoCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    horario_disponivel = db.query(AgendaDisponivel).filter(
        AgendaDisponivel.profissional_id == agendamento.profissional_id,
        AgendaDisponivel.data_hora == agendamento.horario,
        AgendaDisponivel.ocupado == False
    ).first()

    if not horario_disponivel:
        raise HTTPException(
            status_code=400,
            detail="Horário não está disponível para esse profissional."
        )

    novo_agendamento = Agendamento(
    cliente_id=user["id"], 
    profissional_id=agendamento.profissional_id,
    servico_id=agendamento.servico_id,
    horario=agendamento.horario,
    status="pendente"
    )
    db.add(novo_agendamento)

    horario_disponivel.ocupado = True
    db.commit()
    db.refresh(novo_agendamento)

    return novo_agendamento

# @router.get("/", response_model=list[AgendamentoResponse])
# def listar_por_estabelecimento(estabelecimento_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
#     if user["tipo_usuario"] != "admin":
#         raise HTTPException(status_code=403, detail="Apenas administradores podem acessar esta rota")
#     return db.query(Agendamento).filter(Agendamento.profissional.has(estabelecimento_id=estabelecimento_id)).all()

@router.get("/")
def listar_agendamentos(
    estabelecimento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar esta rota")

    resultados = db.execute("""
        SELECT 
            u.nome as cliente, 
            f.nome as profissional, 
            s.nome as servico, 
            s.preco, 
            a.horario
        FROM agendamentos a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN funcionarios f ON f.id = a.profissional_id
        JOIN servicos s ON s.id = a.servico_id
        WHERE f.estabelecimento_id = :estabelecimento_id
    """, {"estabelecimento_id": estabelecimento_id}).fetchall()

    return [dict(r) for r in resultados]

@router.get("/cancelados")
def listar_agendamentos_cancelados(estabelecimento_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    resultados = db.execute("""
        SELECT 
            a.id,
            u.nome AS cliente,
            f.nome AS profissional,
            s.nome AS servico,
            s.preco,
            a.cancelado_em
        FROM agendamentos_cancelados a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN funcionarios f ON f.id = a.profissional_id
        JOIN servicos s ON s.id = a.servico_id
        WHERE f.estabelecimento_id = :estabelecimento_id
        ORDER BY a.cancelado_em DESC
    """, {"estabelecimento_id": estabelecimento_id}).fetchall()

    return [dict(r) for r in resultados]

@router.get("/meus-cancelados", response_model=list[AgendamentoCanceladoResponse])
def listar_cancelamentos_cliente(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(AgendamentoCancelado).filter(AgendamentoCancelado.cliente_id == user["id"]).all()

@router.get("/meus", response_model=list[AgendamentoResponse])
def listar_meus_agendamentos(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Agendamento).filter(Agendamento.cliente_id == user["id"]).all()

@router.put("/{agendamento_id}", response_model=AgendamentoResponse)
def atualizar_status_agendamento(
    agendamento_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")

    agendamento.status = status
    db.commit()
    db.refresh(agendamento)
    return agendamento

@router.delete("/{agendamento_id}", status_code=status.HTTP_200_OK)
def cancelar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if agendamento.cliente_id != user["id"] and user["tipo_usuario"] != "admin":
        raise HTTPException(status_code=403, detail="Você não tem permissão para cancelar este agendamento.")

    db.delete(agendamento)
    db.commit()

    return {"message": "Agendamento cancelado com sucesso!"}
