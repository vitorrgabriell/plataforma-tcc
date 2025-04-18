from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date, time
from app.db.database import get_db
from app.models.agenda_disponivel import AgendaDisponivel
from app.models.funcionarios import Funcionario
from app.schemas import AgendaCreate, AgendaResponse, GerarAgendaRequest, GerarAgendaAdminRequest
from app.models.configuracao_agenda import ConfiguracaoAgenda
from app.utils.dependencies import get_current_user
from pprint import pprint

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
    return db.query(AgendaDisponivel).filter(
        AgendaDisponivel.profissional_id == profissional_id,
        AgendaDisponivel.data_hora >= datetime.now(),
        AgendaDisponivel.ocupado == False
    ).order_by(AgendaDisponivel.data_hora).all()

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

@router.post("/gerar-agenda/")
def gerar_horarios_automaticamente(
    dados: GerarAgendaRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    profissional_id = dados.profissional_id
    data = dados.data

    if user["tipo_usuario"] == "cliente":
        raise HTTPException(status_code=403, detail="Clientes não têm permissão para gerar agendas.")

    elif user["tipo_usuario"] == "profissional":
        funcionario = db.query(Funcionario).filter_by(usuario_id=user["id"]).first()
        if not funcionario:
            raise HTTPException(status_code=403, detail="Funcionário não encontrado.")
        if funcionario.id != profissional_id:
            raise HTTPException(status_code=403, detail="Você só pode gerar sua própria agenda.")

    data_base = datetime.strptime(data, "%Y-%m-%d")
    dia_semana = data_base.strftime("%A").lower()
    dia_semana = {
        "monday": "segunda",
        "tuesday": "terca",
        "wednesday": "quarta",
        "thursday": "quinta",
        "friday": "sexta",
        "saturday": "sabado",
        "sunday": "domingo"
    }[dia_semana]

    config = db.query(ConfiguracaoAgenda).filter_by(
        profissional_id=profissional_id,
        dia_semana=dia_semana
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"Não há configuração de agenda cadastrada para {dia_semana.title()}."
        )

    hora_inicio = datetime.combine(data_base, datetime.strptime(config.hora_inicio, "%H:%M").time())
    hora_fim = datetime.combine(data_base, datetime.strptime(config.hora_fim, "%H:%M").time())
    duracao_minutos = config.duracao_slot

    slots = []
    atual = hora_inicio
    while atual + timedelta(minutes=duracao_minutos) <= hora_fim:
        existe = db.query(AgendaDisponivel).filter_by(
            profissional_id=profissional_id,
            data_hora=atual
        ).first()

        if not existe:
            novo_slot = AgendaDisponivel(
                profissional_id=profissional_id,
                data_hora=atual,
                ocupado=False
            )
            db.add(novo_slot)
            slots.append(atual.strftime("%H:%M"))

        atual += timedelta(minutes=duracao_minutos)

    db.commit()

    return {
        "mensagem": "Horários gerados com sucesso com base na configuração",
        "data": data,
        "dia_semana": dia_semana,
        "total_criados": len(slots),
        "horarios_criados": slots
    }

@router.post("/gerar-agenda-admin/", status_code=200)
def gerar_agenda_para_todos(
    dados: GerarAgendaAdminRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    print("payload do front de gerar agenda:")
    print("Payload recebido:", dados)
    print("Tipo do objeto recebido:", type(dados))
    print("Campos disponíveis:", dir(dados))
    if user["tipo_usuario"] != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem gerar agendas")

    estabelecimento_id = user["estabelecimento_id"]

    profissionais = db.query(Funcionario).filter_by(estabelecimento_id=estabelecimento_id).all()

    if not profissionais:
        raise HTTPException(status_code=404, detail="Nenhum profissional encontrado para este estabelecimento")

    data_inicio = datetime.strptime(dados.data_inicio, "%Y-%m-%d").date()
    data_fim = datetime.strptime(dados.data_fim, "%Y-%m-%d").date()
    hora_inicio = datetime.strptime(dados.horario_inicio, "%H:%M").time()
    hora_fim = datetime.strptime(dados.horario_fim, "%H:%M").time()

    dias_semana = dados.dias_semana
    duracao = timedelta(minutes=dados.duracao_minutos)

    for profissional in profissionais:
        data_atual = data_inicio
        while data_atual <= data_fim:
            if data_atual.weekday() in dias_semana:
                horario = datetime.combine(data_atual, hora_inicio)
                horario_fim = datetime.combine(data_atual, hora_fim)

                while horario + duracao <= horario_fim:
                    nova_agenda = AgendaDisponivel(
                        profissional_id=profissional.id,
                        estabelecimento_id=estabelecimento_id,
                        data_hora=horario,
                        ocupado=False,
                        criado_em=datetime.now()
                    )
                    db.add(nova_agenda)
                    horario += duracao
            data_atual += timedelta(days=1)

    db.commit()

    return {"message": "Agendas geradas com sucesso para todos os profissionais."}