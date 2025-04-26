import boto3
from datetime import datetime, timedelta
from uuid import uuid4
from decimal import Decimal
import os

aws_region = os.getenv("AWS_REGION")
aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")

dynamodb = boto3.resource(
    "dynamodb",
    region_name=aws_region,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key
)

table = dynamodb.Table("servicos_finalizados_plataforma_tcc")

def salvar_servico_finalizado(agendamento, cliente_nome, profissional_nome, estabelecimento_nome, servico_nome, tempo, valor, estabelecimento_id):
    response = table.put_item(
        Item={
            "id_agendamento": str(agendamento.id), 
            "id": str(uuid4()),                  
            "cliente_id": agendamento.cliente_id,
            "cliente_nome": cliente_nome,
            "profissional_id": agendamento.profissional_id,
            "profissional_nome": profissional_nome,
            "estabelecimento_id": estabelecimento_id,
            "estabelecimento_nome": estabelecimento_nome,
            "servico_id": agendamento.servico_id,
            "servico_nome": servico_nome,
            "tempo": tempo,
            "valor": Decimal(str(valor)),
            "data_inicio": agendamento.horario.isoformat(),
            "data_fim": (agendamento.horario + timedelta(minutes=tempo)).isoformat(),
            "criado_em": datetime.utcnow().isoformat()
        }
    )
    return response
