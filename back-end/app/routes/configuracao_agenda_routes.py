from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
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
def criar_configuracao_agenda(
    config: ConfiguracaoAgendaCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores podem cadastrar configurações de agenda.",
        )

    nova_config = ConfiguracaoAgenda(
        profissional_id=config.profissional_id,
        dia_semana=config.dia_semana.lower(),
        hora_inicio=config.hora_inicio,
        hora_fim=config.hora_fim,
        duracao_slot=config.duracao_slot,
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


@router.put("/{config_id}", response_model=ConfiguracaoAgendaResponse)
def atualizar_configuracao_agenda(
    config_id: int,
    dados: ConfiguracaoAgendaUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(
            status_code=403, detail="Apenas administradores podem editar configurações."
        )

    config = db.query(ConfiguracaoAgenda).filter_by(id=config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuração não encontrada.")

    config.hora_inicio = dados.hora_inicio
    config.hora_fim = dados.hora_fim
    config.duracao_slot = dados.duracao_slot

    db.commit()
    db.refresh(config)
    return config


@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_configuracao_agenda(
    config_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores podem deletar configurações.",
        )

    config = db.query(ConfiguracaoAgenda).filter_by(id=config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuração não encontrada.")

    db.delete(config)
    db.commit()
