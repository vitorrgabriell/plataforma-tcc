from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.agendamento import Agendamento
from app.schemas import AgendamentoCreate, AgendamentoResponse
from app.utils.dependencies import get_current_user
from datetime import datetime
from app.models.agenda_disponivel import AgendaDisponivel

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

@router.get("/", response_model=list[AgendamentoResponse])
def listar_agendamentos(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Agendamento).all()

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

@router.delete("/{agendamento_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")

    if agendamento.cliente_id != user["id"] and user["tipo_usuario"] != "admin":
        raise HTTPException(status_code=403, detail="Ação não permitida")

    db.delete(agendamento)
    db.commit()
