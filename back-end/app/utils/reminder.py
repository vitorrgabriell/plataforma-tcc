from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.agendamento import Agendamento
from app.models.user import User
from app.models.funcionarios import Funcionario
from app.utils.notifications import enviar_email_1_dia, enviar_email_1_hora


def verificar_e_enviar_notificacoes_agendamentos(db: Session):
    agora = datetime.now()
    print(f"[LEMBRETE] Iniciando verificação - Agora: {agora}")

    agendamentos = (
        db.query(Agendamento).filter(Agendamento.status == "confirmado").all()
    )

    print(f"[LEMBRETE] Agendamentos confirmados encontrados: {len(agendamentos)}")

    for agendamento in agendamentos:
        print(f"\n[LEMBRETE] Avaliando agendamento ID {agendamento.id}")
        print(f" - Horário: {agendamento.horario}")
        print(f" - Notificado 1 dia: {agendamento.notificado_1_dia}")
        print(f" - Notificado 1 hora: {agendamento.notificado_1_hora}")

        tempo_para_agendamento = agendamento.horario - agora
        print(f" - Tempo restante: {tempo_para_agendamento}")

        cliente = db.query(User).filter(User.id == agendamento.cliente_id).first()
        profissional = (
            db.query(Funcionario)
            .filter(Funcionario.id == agendamento.profissional_id)
            .first()
        )

        if not cliente or not profissional:
            print(" - Cliente ou profissional não encontrado. Pulando...")
            continue

        if (
            timedelta(hours=23, minutes=30)
            < tempo_para_agendamento
            <= timedelta(days=1)
            and not agendamento.notificado_1_dia
        ):
            print(" - Enviando lembrete de 1 DIA")
            enviar_email_1_dia(cliente.email, cliente.nome, agendamento)
            enviar_email_1_dia(profissional.email, profissional.nome, agendamento)
            agendamento.notificado_1_dia = True

        elif (
            timedelta(minutes=50) < tempo_para_agendamento <= timedelta(hours=1)
            and not agendamento.notificado_1_hora
        ):
            print(" - Enviando lembrete de 1 HORA")
            enviar_email_1_hora(cliente.email, cliente.nome, agendamento)
            enviar_email_1_hora(profissional.email, profissional.nome, agendamento)
            agendamento.notificado_1_hora = True

    db.commit()
    print("[LEMBRETE] Verificação concluída e alterações salvas.\n")
