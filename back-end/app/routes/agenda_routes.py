from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.agenda_disponivel import AgendaDisponivel
from app.models.funcionarios import Funcionario
from app.schemas import AgendaCreate, AgendaResponse
from app.utils.dependencies import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=AgendaResponse, status_code=status.HTTP_201_CREATED)
def criar_horario_disponivel(
    agenda: AgendaCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    func = db.query(Funcionario).filter(Funcionario.id == agenda.profissional_id).first()

    if not func or func.usuario_id != user["id"]:
        raise HTTPException(status_code=403, detail="Ação não permitida")

    novo_horario = AgendaDisponivel(
        profissional_id=agenda.profissional_id,
        data_hora=agenda.data_hora,
        ocupado=False
    )
    db.add(novo_horario)
    db.commit()
    db.refresh(novo_horario)
    return novo_horario

@router.get("/", response_model=list[AgendaResponse])
def listar_agenda(
    profissional_id: int = Query(..., description="ID do profissional"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(AgendaDisponivel).filter(AgendaDisponivel.profissional_id == profissional_id).all()

@router.delete("/{horario_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_horario(
    horario_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    horario = db.query(AgendaDisponivel).filter(AgendaDisponivel.id == horario_id).first()
    if not horario:
        raise HTTPException(status_code=404, detail="Horário não encontrado")

    if user["tipo_usuario"] != "profissional" or user["id"] != horario.profissional_id:
        raise HTTPException(status_code=403, detail="Ação não permitida")

    db.delete(horario)
    db.commit()
