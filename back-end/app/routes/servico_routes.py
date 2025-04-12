from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.servico import Servico
from app.schemas import ServicoCreate, ServicoResponse
from app.utils.dependencies import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ServicoResponse, status_code=status.HTTP_201_CREATED)
def criar_servico(servico: ServicoCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["tipo_usuario"] not in ["admin", "estabelecimento"]:
        raise HTTPException(status_code=403, detail="Permissão negada.")
    
    novo_servico = Servico(
        nome=servico.nome,
        descricao=servico.descricao,
        preco=servico.preco,
        estabelecimento_id=user["estabelecimento_id"],
        criado_em=datetime.utcnow()
    )
    db.add(novo_servico)
    db.commit()
    db.refresh(novo_servico)
    return novo_servico

@router.get("/", response_model=list[ServicoResponse])
def listar_servicos(
    estabelecimento_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Servico).filter(Servico.estabelecimento_id == estabelecimento_id).all()

@router.get("/{servico_id}", response_model=ServicoResponse)
def buscar_servico(servico_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    servico = db.query(Servico).filter(Servico.id == servico_id).first()
    if not servico or servico.estabelecimento_id != user["estabelecimento_id"]:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")
    return servico

@router.put("/{servico_id}", response_model=ServicoResponse)
def atualizar_servico(servico_id: int, servico_atualizado: ServicoCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    servico = db.query(Servico).filter(Servico.id == servico_id).first()
    if not servico or servico.estabelecimento_id != user["estabelecimento_id"]:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")

    servico.nome = servico_atualizado.nome
    servico.descricao = servico_atualizado.descricao
    servico.preco = servico_atualizado.preco
    db.commit()
    db.refresh(servico)
    return servico

@router.delete("/{servico_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_servico(servico_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    servico = db.query(Servico).filter(Servico.id == servico_id).first()
    if not servico or servico.estabelecimento_id != user["estabelecimento_id"]:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")
    
    db.delete(servico)
    db.commit()
