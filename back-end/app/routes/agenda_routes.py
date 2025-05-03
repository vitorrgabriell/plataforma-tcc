from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date, time
from app.db.database import get_db
from app.models.agenda_disponivel import AgendaDisponivel
from app.models.funcionarios import Funcionario
from app.schemas import AgendaCreate, AgendaResponse, GerarAgendaRequest, GerarAgendaAdminRequest
from app.models.agendamento import Agendamento
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
    horarios_com_agendamento = db.query(Agendamento.horario).filter(
        Agendamento.profissional_id == profissional_id,
        Agendamento.status == "confirmado"
    ).subquery()

    horarios_disponiveis = db.query(AgendaDisponivel).filter(
        AgendaDisponivel.profissional_id == profissional_id,
        AgendaDisponivel.data_hora >= datetime.now(),
        AgendaDisponivel.data_hora.notin_(horarios_com_agendamento)
    ).order_by(AgendaDisponivel.data_hora).all()

    return horarios_disponiveis

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
def gerar_horarios_profissional(
    dados: GerarAgendaRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(status_code=403, detail="Apenas profissionais podem gerar suas agendas.")

    funcionario = db.query(Funcionario).filter_by(usuario_id=user["id"]).first()
    if not funcionario or funcionario.id != dados.profissional_id:
        raise HTTPException(status_code=403, detail="Você só pode gerar sua própria agenda.")

    data_inicio = datetime.strptime(dados.data_inicial, "%Y-%m-%d").date()
    data_fim = data_inicio + timedelta(days=6) if dados.semana_toda else data_inicio

    conflitos = db.query(AgendaDisponivel).filter(
        AgendaDisponivel.profissional_id == funcionario.id,
        AgendaDisponivel.data_hora >= datetime.combine(data_inicio, datetime.min.time()),
        AgendaDisponivel.data_hora <= datetime.combine(data_fim, datetime.max.time())
    ).first()

    if conflitos:
        raise HTTPException(
            status_code=400,
            detail="Já existem horários cadastrados neste período. Não é possível gerar novamente."
        )

    duracao = timedelta(minutes=dados.duracao_minutos)
    horarios_personalizados = dados.horarios_personalizados or []
    total_criados = 0
    horarios_criados = []
    data_atual = data_inicio

    if dados.usar_padrao or not horarios_personalizados:
        horarios_personalizados = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]

    while data_atual <= data_fim:
        for horario_str in horarios_personalizados:
            hora = datetime.strptime(horario_str, "%H:%M").time()
            data_hora = datetime.combine(data_atual, hora)

            slot = AgendaDisponivel(
                profissional_id=funcionario.id,
                estabelecimento_id=funcionario.estabelecimento_id,
                data_hora=data_hora,
                ocupado=False
            )
            db.add(slot)
            total_criados += 1
            horarios_criados.append(data_hora.strftime("%Y-%m-%d %H:%M"))
        data_atual += timedelta(days=1)

    db.commit()

    return {
        "mensagem": "Agenda gerada com sucesso!",
        "de": str(data_inicio),
        "ate": str(data_fim),
        "total_criados": total_criados,
        "horarios_criados": horarios_criados
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