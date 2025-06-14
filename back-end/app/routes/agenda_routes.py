from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date, time
from app.db.database import get_db
from app.models.agenda_disponivel import AgendaDisponivel
from app.models.funcionarios import Funcionario
from app.schemas import (
    AgendaCreate,
    AgendaResponse,
    GerarAgendaRequest,
    GerarAgendaAdminRequest,
)
from app.models.agendamento import Agendamento
from app.models.configuracao_agenda import ConfiguracaoAgenda
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.post("/", response_model=AgendaResponse, status_code=status.HTTP_201_CREATED)
def criar_horario_disponivel(
    agenda: AgendaCreate, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    func = (
        db.query(Funcionario).filter(Funcionario.id == agenda.profissional_id).first()
    )

    if not func or func.usuario_id != user["id"]:
        raise HTTPException(status_code=403, detail="Ação não permitida")

    novo_horario = AgendaDisponivel(
        profissional_id=agenda.profissional_id,
        data_hora=agenda.data_hora,
        ocupado=False,
    )
    db.add(novo_horario)
    db.commit()
    db.refresh(novo_horario)
    return novo_horario


@router.get("/", response_model=list[AgendaResponse])
def listar_agenda(
    profissional_id: int = Query(..., description="ID do profissional"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    horarios_com_agendamento = (
        db.query(Agendamento.horario)
        .filter(
            Agendamento.profissional_id == profissional_id,
            Agendamento.status == "confirmado",
        )
        .subquery()
    )

    horarios_disponiveis = (
        db.query(AgendaDisponivel)
        .filter(
            AgendaDisponivel.profissional_id == profissional_id,
            AgendaDisponivel.data_hora >= datetime.now(),
            AgendaDisponivel.data_hora.notin_(horarios_com_agendamento),
            AgendaDisponivel.ocupado == False,
        )
        .order_by(AgendaDisponivel.data_hora)
        .all()
    )

    return horarios_disponiveis


@router.delete("/{horario_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_horario(
    horario_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    horario = (
        db.query(AgendaDisponivel).filter(AgendaDisponivel.id == horario_id).first()
    )
    if not horario:
        raise HTTPException(status_code=404, detail="Horário não encontrado")

    if user["tipo_usuario"] != "profissional" or user["id"] != horario.profissional_id:
        raise HTTPException(status_code=403, detail="Ação não permitida")

    db.delete(horario)
    db.commit()

@router.get("/horarios-profissional")
def listar_configuracoes_do_profissional(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(status_code=403, detail="Apenas profissionais podem acessar esta rota.")

    configuracoes = (
        db.query(ConfiguracaoAgenda)
        .filter(ConfiguracaoAgenda.profissional_id == user["funcionario_id"])
        .all()
    )

    resultado = []
    for conf in configuracoes:
        hora_inicio = datetime.strptime(conf.hora_inicio, "%H:%M").time()
        hora_fim = datetime.strptime(conf.hora_fim, "%H:%M").time()
        atual = datetime.combine(date.today(), hora_inicio)
        fim = datetime.combine(date.today(), hora_fim)
        while atual <= fim:
            resultado.append(atual.strftime("%H:%M"))
            atual += timedelta(minutes=conf.duracao_slot)

    resultado = sorted(set(resultado))

    return {"horarios": resultado}


@router.post("/gerar-agenda/")
def gerar_horarios_profissional(
    dados: GerarAgendaRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(
            status_code=403, detail="Apenas profissionais podem gerar suas agendas."
        )

    funcionario = db.query(Funcionario).filter_by(usuario_id=user["id"]).first()
    if not funcionario or funcionario.id != dados.profissional_id:
        raise HTTPException(
            status_code=403, detail="Você só pode gerar sua própria agenda."
        )
    
    print(dados.profissional_id)
    print(funcionario.id)

    data_inicio = datetime.strptime(dados.data_inicial, "%Y-%m-%d").date()
    data_fim = data_inicio + timedelta(days=6) if dados.semana_toda else data_inicio

    total_criados = 0
    horarios_criados = []
    data_atual = data_inicio

    if dados.usar_padrao:
        configuracoes = (
            db.query(ConfiguracaoAgenda)
            .filter(ConfiguracaoAgenda.profissional_id == funcionario.id)
            .all()
        )

        if not configuracoes:
            raise HTTPException(status_code=404, detail="Nenhuma configuração de agenda foi encontrada.")

        while data_atual <= data_fim:
            dia_semana = data_atual.weekday()
            print(f"[DEBUG] Dia atual: {data_atual} (weekday: {dia_semana})")
            dias_semana_map = {
                0: "segunda",
                1: "terca",
                2: "quarta",
                3: "quinta",
                4: "sexta",
                5: "sabado",
                6: "domingo"
            }
            dia_semana = dias_semana_map[data_atual.weekday()]
            confs_dia = [c for c in configuracoes if c.dia_semana == dia_semana]
            print(f"[DEBUG] Configurações encontradas nesse dia: {len(confs_dia)}")

            for conf in confs_dia:
                print(f"[DEBUG] Hora início: {conf.hora_inicio}, Hora fim: {conf.hora_fim}, Duração: {conf.duracao_slot}")
                hora_inicio = datetime.combine(data_atual, datetime.strptime(conf.hora_inicio, "%H:%M").time())
                hora_fim = datetime.combine(data_atual, datetime.strptime(conf.hora_fim, "%H:%M").time())
                atual = hora_inicio
                duracao = timedelta(minutes=conf.duracao_slot)

                while atual + duracao <= hora_fim:
                    print(f"[DEBUG] Criando slot para {atual}")
                    conflito_existente = db.query(AgendaDisponivel).filter_by(
                        profissional_id=funcionario.id,
                        data_hora=atual
                    ).first()

                    if not conflito_existente:
                        slot = AgendaDisponivel(
                            profissional_id=funcionario.id,
                            estabelecimento_id=funcionario.estabelecimento_id,
                            data_hora=atual,
                            ocupado=False,
                        )
                        db.add(slot)
                        total_criados += 1
                        horarios_criados.append(atual.strftime("%Y-%m-%d %H:%M"))

                    atual += duracao

            data_atual += timedelta(days=1)

    else:
        while data_atual <= data_fim:
            for horario_str in dados.horarios_personalizados:
                hora = datetime.strptime(horario_str, "%H:%M").time()
                data_hora = datetime.combine(data_atual, hora)

                conflito_existente = db.query(AgendaDisponivel).filter_by(
                    profissional_id=funcionario.id,
                    data_hora=data_hora
                ).first()

                if not conflito_existente:
                    slot = AgendaDisponivel(
                        profissional_id=funcionario.id,
                        estabelecimento_id=funcionario.estabelecimento_id,
                        data_hora=data_hora,
                        ocupado=False,
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
        "horarios_criados": horarios_criados,
    }


@router.post("/gerar-agenda-admin/", status_code=200)
def gerar_agenda_para_todos(
    dados: GerarAgendaAdminRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem gerar agendas")

    estabelecimento_id = user["estabelecimento_id"]

    profissionais = db.query(Funcionario).filter_by(estabelecimento_id=estabelecimento_id).all()

    if not profissionais:
        raise HTTPException(status_code=404, detail="Nenhum profissional encontrado para este estabelecimento")

    data_inicio = dados.data_inicio
    data_fim = dados.data_fim

    for profissional in profissionais:
        configuracoes = db.query(ConfiguracaoAgenda).filter_by(profissional_id=profissional.id).all()

        if not configuracoes:
            continue

        data_atual = data_inicio
        while data_atual <= data_fim:
            dias_semana_map = {
                0: "segunda",
                1: "terca",
                2: "quarta",
                3: "quinta",
                4: "sexta",
                5: "sabado",
                6: "domingo"
            }
            dia_semana = dias_semana_map[data_atual.weekday()]

            config_do_dia = [cfg for cfg in configuracoes if cfg.dia_semana == dia_semana]

            for config in config_do_dia:
                hora_inicio = datetime.combine(data_atual, datetime.strptime(config.hora_inicio, "%H:%M").time())
                hora_fim = datetime.combine(data_atual, datetime.strptime(config.hora_fim, "%H:%M").time())
                duracao = timedelta(minutes=config.duracao_slot)

                horario = hora_inicio
                while horario + duracao <= hora_fim:
                    nova_agenda = AgendaDisponivel(
                        profissional_id=profissional.id,
                        estabelecimento_id=estabelecimento_id,
                        data_hora=horario,
                        ocupado=False,
                        criado_em=datetime.now(),
                    )
                    db.add(nova_agenda)
                    horario += duracao

            data_atual += timedelta(days=1)

    db.commit()
    return {"message": "Agendas geradas com sucesso com base na configuração dos profissionais."}

