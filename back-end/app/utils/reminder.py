from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.agendamento import Agendamento
from app.models.user import User
from app.models.funcionarios import Funcionario
from app.utils.notifications import enviar_email_1_dia, enviar_email_1_hora


def verificar_e_enviar_notificacoes_agendamentos(db: Session):
    agora = datetime.now()

    agendamentos = (
        db.query(Agendamento).filter(Agendamento.status == "confirmado").all()
    )

    for agendamento in agendamentos:
        tempo_para_agendamento = agendamento.horario - agora

        cliente = db.query(User).filter(User.id == agendamento.cliente_id).first()
        profissional = (
            db.query(Funcionario)
            .filter(Funcionario.id == agendamento.profissional_id)
            .first()
        )

        if not cliente or not profissional:
            continue

        if (
            timedelta(hours=23, minutes=30)
            < tempo_para_agendamento
            <= timedelta(days=1)
            and not agendamento.notificado_1_dia
        ):
            enviar_email_1_dia(cliente.email, cliente.nome, agendamento)
            enviar_email_1_dia(profissional.email, profissional.nome, agendamento)
            agendamento.notificado_1_dia = True

        elif (
            timedelta(minutes=50) < tempo_para_agendamento <= timedelta(hours=1)
            and not agendamento.notificado_1_hora
        ):
            enviar_email_1_hora(cliente.email, cliente.nome, agendamento)
            enviar_email_1_hora(profissional.email, profissional.nome, agendamento)
            agendamento.notificado_1_hora = True

    db.commit()
