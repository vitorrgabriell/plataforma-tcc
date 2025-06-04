from fastapi import HTTPException
import boto3
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")
EMAIL_FROM = os.getenv("EMAIL_FROM")
FRONTEND_RESET_URL = os.getenv("FRONTEND_RESET_URL")

ses = boto3.client(
    'ses',
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def enviar_email_recuperacao(destinatario_email, token):
    link = f"{FRONTEND_RESET_URL}/{token}"
    try:
        ses.send_email(
            Source=EMAIL_FROM,
            Destination={'ToAddresses': [destinatario_email]},
            Message={
                'Subject': {'Data': 'Redefinição de Senha - AgendaVip'},
                'Body': {
                    'Html': {'Data': montar_email_html(link)},
                    'Text': {
                        'Data': f"Olá,\n\nClique aqui para redefinir sua senha:\n{link}"
                    },
                },
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao enviar e-mail.")


def montar_email_html(link):
    return f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <style>
          body {{
            background-color: #f4f4f5;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #1f2937;
          }}
          .container {{
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          }}
          h1 {{
            font-size: 22px;
            margin-bottom: 20px;
            color: #111827;
          }}
          p {{
            font-size: 16px;
            line-height: 1.6;
          }}
          .button {{
            display: inline-block;
            margin-top: 30px;
            padding: 14px 24px;
            background-color: #3b82f6;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: background-color 0.2s ease;
          }}
          .button:hover {{
            background-color: #2563eb;
          }}
          .footer {{
            margin-top: 40px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }}
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Redefinição de Senha</h1>
          <p>Olá,</p>
          <p>
            Recebemos uma solicitação para redefinir sua senha no
            <strong>AgendaVip</strong>.
          </p>
          <p>Para continuar, clique no botão abaixo:</p>

          <a href="{link}" class="button">Redefinir Senha</a>

          <p>
            Se você não solicitou essa alteração, apenas ignore este e-mail. O link
            irá expirar em 1 hora por motivos de segurança.
          </p>

          <div class="footer">
            © {datetime.now().year} AgendaVip. Todos os direitos reservados.
          </div>
        </div>
      </body>
    </html>
    """
