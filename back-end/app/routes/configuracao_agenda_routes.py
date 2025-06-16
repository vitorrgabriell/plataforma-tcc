from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import time
from app.db.database import get_db
from app.utils.dependencies import get_current_user
from app.models.configuracao_agenda import ConfiguracaoAgenda
from app.schemas import (
    ConfiguracaoAgendaCreate,
    ConfiguracaoAgendaUpdate,
    ConfiguracaoAgendaResponse,
)

router = APIRouter()


@router.post("/", response_model=ConfiguracaoAgendaResponse)
def criar_ou_atualizar_configuracao_agenda(
    config: ConfiguracaoAgendaCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores podem cadastrar configurações de agenda.",
        )

    dia = config.dia_semana.lower()

    conflito = (
        db.query(ConfiguracaoAgenda)
        .filter(
            ConfiguracaoAgenda.profissional_id == config.profissional_id,
            ConfiguracaoAgenda.dia_semana == dia,
            ConfiguracaoAgenda.hora_inicio < config.hora_fim,
            ConfiguracaoAgenda.hora_fim > config.hora_inicio,
        )
        .first()
    )

    if conflito:
        conflito.hora_inicio = config.hora_inicio
        conflito.hora_fim = config.hora_fim
        conflito.duracao_slot = config.duracao_slot
        db.commit()
        db.refresh(conflito)
        return conflito

    nova_config = ConfiguracaoAgenda(
        profissional_id=config.profissional_id,
        dia_semana=dia,
        hora_inicio=config.hora_inicio,
        hora_fim=config.hora_fim,
        duracao_slot=config.duracao_slot,
        estabelecimento_id=user["estabelecimento_id"],
    )

    db.add(nova_config)
    db.commit()
    db.refresh(nova_config)
    return nova_config


@router.get("/{profissional_id}", response_model=list[ConfiguracaoAgendaResponse])
def listar_configuracoes(
    profissional_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    return (
        db.query(ConfiguracaoAgenda)
        .filter(ConfiguracaoAgenda.profissional_id == profissional_id)
        .order_by(ConfiguracaoAgenda.dia_semana)
        .all()
    )
