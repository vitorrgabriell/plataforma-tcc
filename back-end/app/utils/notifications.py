from fastapi import HTTPException
import boto3
import os
from dotenv import load_dotenv
from datetime import datetime
from app.models.agendamento import Agendamento

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")
EMAIL_FROM = os.getenv("EMAIL_FROM")
FRONTEND_LOGIN_URL = os.getenv("FRONTEND_LOGIN_URL")

ses = boto3.client(
    'ses',
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def enviar_email_mudanca_horario(
    destinatario_email,
    nome_profissional,
    nome_cliente,
    nome_servico,
    nova_data,
    novo_horario,
):
    html = montar_html_mudanca_horario(
        nome_profissional, nome_cliente, nome_servico, nova_data, novo_horario
    )
    try:
        ses.send_email(
            Source=EMAIL_FROM,
            Destination={'ToAddresses': [destinatario_email]},
            Message={
                'Subject': {'Data': 'Alteração de Agendamento - AgendaVip'},
                'Body': {
                    'Html': {'Data': html},
                    'Text': {
                        'Data': f"O cliente {nome_cliente} alterou a data/horário do serviço {nome_servico}. Nova data: {nova_data}, novo horário: {novo_horario}."
                    },
                },
            },
        )
    except Exception as e:
        print(f"[ERRO AO ENVIAR E-MAIL SES] {e}")
        raise HTTPException(status_code=500, detail="Erro ao enviar e-mail.")


def enviar_email_mudanca_profissional(
    destinatario_email, nome_profissional, nome_cliente, nome_servico
):
    html = montar_html_mudanca_profissional(
        nome_profissional, nome_cliente, nome_servico
    )
    try:
        ses.send_email(
            Source=EMAIL_FROM,
            Destination={'ToAddresses': [destinatario_email]},
            Message={
                'Subject': {'Data': 'Atualização de Agendamento - AgendaVip'},
                'Body': {
                    'Html': {'Data': html},
                    'Text': {
                        'Data': f"O cliente {nome_cliente} alterou o profissional para o serviço {nome_servico}."
                    },
                },
            },
        )
    except Exception as e:
        print(f"[ERRO AO ENVIAR E-MAIL SES] {e}")
        raise HTTPException(status_code=500, detail="Erro ao enviar e-mail.")


def montar_html_mudanca_horario(profissional, cliente, servico, data, hora):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2>Alteração de Agendamento</h2>
            <p>Olá <strong>{profissional}</strong>,</p>
            <p>O cliente <strong>{cliente}</strong> alterou o horário do serviço <strong>{servico}</strong>.</p>
            <p>🗓️ Nova data: <strong>{data}</strong><br>⏰ Novo horário: <strong>{hora}</strong></p>
            <a href="{FRONTEND_LOGIN_URL}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;">Acessar Plataforma</a>
            <p style="font-size: 12px; color: #888; margin-top: 40px;">© {datetime.now().year} AgendaVip</p>
        </div>
    </body>
    </html>
    """


def montar_html_mudanca_profissional(profissional, cliente, servico):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2>Atualização de Agendamento</h2>
            <p>Olá <strong>{profissional}</strong>,</p>
            <p>O cliente <strong>{cliente}</strong> alterou o profissional responsável pelo serviço <strong>{servico}</strong>.</p>
            <p>Este agendamento não será mais realizado por você.</p>
            <a href="{FRONTEND_LOGIN_URL}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;">Acessar Plataforma</a>
            <p style="font-size: 12px; color: #888; margin-top: 40px;">© {datetime.now().year} AgendaVip</p>
        </div>
    </body>
    </html>
    """


def enviar_email_confirmacao_agendamento(
    destinatario_email,
    nome_cliente,
    nome_profissional,
    nome_servico,
    data,
    horario,
    nome_estabelecimento,
):
    html = montar_html_confirmacao_agendamento(
        nome_cliente,
        nome_profissional,
        nome_servico,
        data,
        horario,
        nome_estabelecimento,
    )
    try:
        ses.send_email(
            Source=EMAIL_FROM,
            Destination={'ToAddresses': [destinatario_email]},
            Message={
                'Subject': {'Data': f'Agendamento Confirmado - {nome_estabelecimento}'},
                'Body': {
                    'Html': {'Data': html},
                    'Text': {
                        'Data': f"Olá {nome_cliente}, seu agendamento no estabelecimento {nome_estabelecimento} para o serviço {nome_servico} com {nome_profissional} foi confirmado. Data: {data}, Horário: {horario}."
                    },
                },
            },
        )
    except Exception as e:
        print(f"[ERRO AO ENVIAR E-MAIL SES] {e}")
        raise HTTPException(status_code=500, detail="Erro ao enviar e-mail.")


def montar_html_confirmacao_agendamento(
    cliente, profissional, servico, data, hora, estabelecimento
):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2>Agendamento Confirmado</h2>
            <p>Olá <strong>{cliente}</strong>,</p>
            <p>Seu agendamento foi confirmado com sucesso no estabelecimento <strong>{estabelecimento}</strong>!</p>
            <p>
                📌 Serviço: <strong>{servico}</strong><br>
                👤 Profissional: <strong>{profissional}</strong><br>
                🗓️ Data: <strong>{data}</strong><br>
                ⏰ Horário: <strong>{hora}</strong>
            </p>
            <a href="{FRONTEND_LOGIN_URL}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;">Acessar Plataforma</a>
            <p style="font-size: 12px; color: #888; margin-top: 40px;">© {datetime.now().year} AgendaVip</p>
        </div>
    </body>
    </html>
    """


def enviar_email_cancelamento_agendamento(
    destinatario_email,
    nome_profissional,
    nome_cliente,
    nome_servico,
    data,
    horario,
    motivo=None,
):
    html = montar_html_cancelamento_agendamento(
        nome_profissional, nome_cliente, nome_servico, data, horario, motivo
    )
    try:
        ses.send_email(
            Source=EMAIL_FROM,
            Destination={'ToAddresses': [destinatario_email]},
            Message={
                'Subject': {'Data': 'Agendamento Cancelado - AgendaVip'},
                'Body': {
                    'Html': {'Data': html},
                    'Text': {
                        'Data': f"O cliente {nome_cliente} cancelou o agendamento do serviço {nome_servico} marcado para {data} às {horario}."
                        + (f"\nMotivo: {motivo}" if motivo else "")
                    },
                },
            },
        )
    except Exception as e:
        print(f"[ERRO AO ENVIAR E-MAIL SES] {e}")
        raise HTTPException(status_code=500, detail="Erro ao enviar e-mail.")


def montar_html_cancelamento_agendamento(
    profissional, cliente, servico, data, hora, motivo
):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2>Agendamento Cancelado</h2>
            <p>Olá <strong>{profissional}</strong>,</p>
            <p>O cliente <strong>{cliente}</strong> cancelou o agendamento do serviço <strong>{servico}</strong>.</p>
            <p>
                📅 Data: <strong>{data}</strong><br>
                ⏰ Horário: <strong>{hora}</strong>
            </p>
            {f"<p><strong>Motivo:</strong> {motivo}</p>" if motivo else ""}
            <a href="{FRONTEND_LOGIN_URL}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;">Acessar Plataforma</a>
            <p style="font-size: 12px; color: #888; margin-top: 40px;">© {datetime.now().year} AgendaVip</p>
        </div>
    </body>
    </html>
    """


def enviar_email_novo_agendamento_profissional(
    destinatario_email, nome_profissional, nome_cliente, nome_servico, data, horario
):
    html = montar_html_novo_agendamento_profissional(
        nome_profissional, nome_cliente, nome_servico, data, horario
    )
    try:
        ses.send_email(
            Source=EMAIL_FROM,
            Destination={'ToAddresses': [destinatario_email]},
            Message={
                'Subject': {'Data': 'Novo Agendamento Atribuído - AgendaVip'},
                'Body': {
                    'Html': {'Data': html},
                    'Text': {
                        'Data': f"Olá {nome_profissional}, você foi designado para um novo agendamento do serviço {nome_servico} com o cliente {nome_cliente}. Data: {data}, Horário: {horario}."
                    },
                },
            },
        )
    except Exception as e:
        print(f"[ERRO AO ENVIAR E-MAIL SES - NOVO PROFISSIONAL] {e}")
        raise HTTPException(
            status_code=500, detail="Erro ao enviar e-mail para o novo profissional."
        )


def montar_html_novo_agendamento_profissional(
    profissional, cliente, servico, data, hora
):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2>Novo Agendamento Atribuído</h2>
            <p>Olá <strong>{profissional}</strong>,</p>
            <p>Você foi designado para um novo agendamento:</p>
            <p>
                📌 Serviço: <strong>{servico}</strong><br>
                👤 Cliente: <strong>{cliente}</strong><br>
                🗓️ Data: <strong>{data}</strong><br>
                ⏰ Horário: <strong>{hora}</strong>
            </p>
            <p>Esse agendamento ainda está pendente de confirmação.</p>
            <a href="{FRONTEND_LOGIN_URL}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;">Acessar Plataforma</a>
            <p style="font-size: 12px; color: #888; margin-top: 40px;">© {datetime.now().year} AgendaVip</p>
        </div>
    </body>
    </html>
    """


def enviar_email_novo_agendamento_cliente(
    destinatario_email,
    nome_cliente,
    nome_profissional,
    nome_servico,
    data,
    horario,
    nome_estabelecimento,
):
    html = montar_html_novo_agendamento_cliente(
        nome_cliente,
        nome_profissional,
        nome_servico,
        data,
        horario,
        nome_estabelecimento,
    )
    try:
        ses.send_email(
            Source=EMAIL_FROM,
            Destination={'ToAddresses': [destinatario_email]},
            Message={
                'Subject': {'Data': 'Novo Agendamento Criado - AgendaVip'},
                'Body': {
                    'Html': {'Data': html},
                    'Text': {
                        'Data': f"Olá {nome_cliente}, seu agendamento para o serviço {nome_servico} com {nome_profissional} foi criado no estabelecimento {nome_estabelecimento}. Data: {data}, Horário: {horario}."
                    },
                },
            },
        )
    except Exception as e:
        print(f"[ERRO AO ENVIAR E-MAIL SES - NOVO CLIENTE] {e}")
        raise HTTPException(
            status_code=500, detail="Erro ao enviar e-mail para o cliente."
        )


def montar_html_novo_agendamento_cliente(
    cliente, profissional, servico, data, hora, estabelecimento
):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2>Agendamento Realizado</h2>
            <p>Olá <strong>{cliente}</strong>,</p>
            <p>Seu agendamento foi registrado com sucesso no estabelecimento <strong>{estabelecimento}</strong>:</p>
            <p>
                📌 Serviço: <strong>{servico}</strong><br>
                👨‍⚕️ Profissional: <strong>{profissional}</strong><br>
                🗓️ Data: <strong>{data}</strong><br>
                ⏰ Horário: <strong>{hora}</strong>
            </p>
            <p>Assim que o profissional <strong>{profissional}</strong> atualizar o status do seu agendamento, você será notificado!
            <a href="{FRONTEND_LOGIN_URL}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;">Visualizar na Plataforma</a>
            <p style="font-size: 12px; color: #888; margin-top: 40px;">© {datetime.now().year} AgendaVip</p>
        </div>
    </body>
    </html>
    """


def enviar_email_1_dia(destinatario_email, nome_destinatario, agendamento: Agendamento):
    assunto = "Lembrete: Seu agendamento é amanhã"
    texto = f"Olá {nome_destinatario}, este é um lembrete que você possui um agendamento amanhã ({agendamento.horario.strftime('%d/%m/%Y')} às {agendamento.horario.strftime('%H:%M')})."

    html = _montar_html_lembrete(
        nome_destinatario,
        titulo="Lembrete: Agendamento amanhã",
        servico=agendamento.servico.nome,
        profissional=agendamento.profissional.nome,
        data=agendamento.horario.strftime("%d/%m/%Y"),
        hora=agendamento.horario.strftime("%H:%M"),
    )

    _enviar_email(destinatario_email, assunto, texto, html)


def enviar_email_1_hora(
    destinatario_email, nome_destinatario, agendamento: Agendamento
):
    assunto = "Lembrete: Seu agendamento é em 1 hora"
    texto = f"Olá {nome_destinatario}, este é um lembrete que seu agendamento começa em aproximadamente 1 hora ({agendamento.horario.strftime('%H:%M')})."
    html = _montar_html_lembrete(
        nome_destinatario,
        agendamento,
        titulo="Lembrete: Agendamento em 1 hora!",
        servico=agendamento.servico.nome,
        profissional=agendamento.profissional.nome,
        data=agendamento.horario.strftime("%d/%m/%Y"),
        hora=agendamento.horario.strftime("%H:%M"),
    )

    _enviar_email(destinatario_email, assunto, texto, html)


def _montar_html_lembrete(nome, titulo, servico, profissional, data, hora):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2>{titulo}</h2>
            <p>Olá <strong>{nome}</strong>,</p>
            <p>Você possui um agendamento confirmado:</p>
            <p>
                📌 Serviço: <strong>{servico}</strong><br>
                👨‍⚕️ Profissional: <strong>{profissional}</strong><br>
                🗓️ Data: <strong>{data}</strong><br>
                ⏰ Horário: <strong>{hora}</strong>
            </p>
            <p>Certifique-se de estar disponível nesse horário.</p>
            <a href="{FRONTEND_LOGIN_URL}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;">Acessar Plataforma</a>
            <p style="font-size: 12px; color: #888; margin-top: 40px;">© {datetime.now().year} AgendaVip</p>
        </div>
    </body>
    </html>
    """


def _enviar_email(destinatario_email, assunto, texto, html):
    try:
        ses.send_email(
            Source=EMAIL_FROM,
            Destination={'ToAddresses': [destinatario_email]},
            Message={
                'Subject': {'Data': assunto},
                'Body': {'Html': {'Data': html}, 'Text': {'Data': texto}},
            },
        )
    except Exception as e:
        print(f"[ERRO AO ENVIAR E-MAIL LEMBRETE] {e}")
        raise HTTPException(
            status_code=500, detail="Erro ao enviar e-mail de lembrete."
        )


def enviar_email_profissional_remarcou(
    destinatario_email,
    nome_cliente,
    nome_profissional,
    nome_servico,
    nova_data,
    novo_horario,
):
    html = montar_html_profissional_remarcou(
        nome_cliente, nome_profissional, nome_servico, nova_data, novo_horario
    )
    try:
        ses.send_email(
            Source=EMAIL_FROM,
            Destination={'ToAddresses': [destinatario_email]},
            Message={
                'Subject': {'Data': 'Atualização do seu agendamento - AgendaVip'},
                'Body': {
                    'Html': {'Data': html},
                    'Text': {
                        'Data': f"Olá {nome_cliente}, o profissional {nome_profissional} alterou o horário do seu agendamento para o serviço {nome_servico}. Novo horário: {nova_data} às {novo_horario}."
                    },
                },
            },
        )
    except Exception as e:
        print(f"[ERRO AO ENVIAR E-MAIL SES - PROFISSIONAL REMARCOU] {e}")
        raise HTTPException(
            status_code=500, detail="Erro ao enviar e-mail de atualização ao cliente."
        )


def montar_html_profissional_remarcou(cliente, profissional, servico, data, hora):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2>Horário Atualizado</h2>
            <p>Olá <strong>{cliente}</strong>,</p>
            <p>O profissional <strong>{profissional}</strong> alterou o horário do seu agendamento.</p>
            <p>
                📌 Serviço: <strong>{servico}</strong><br>
                🗓️ Nova data: <strong>{data}</strong><br>
                ⏰ Novo horário: <strong>{hora}</strong>
            </p>
            <p>Se tiver alguma dúvida, entre em contato com o estabelecimento.</p>
            <a href="{FRONTEND_LOGIN_URL}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;">Ver na Plataforma</a>
            <p style="font-size: 12px; color: #888; margin-top: 40px;">© {datetime.now().year} AgendaVip</p>
        </div>
    </body>
    </html>
    """
