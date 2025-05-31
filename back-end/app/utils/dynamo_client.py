import boto3
from boto3.dynamodb.conditions import Key, Attr
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
    aws_secret_access_key=aws_secret_key,
)

table = dynamodb.Table("servicos_finalizados_plataforma_tcc")
pontos_table = dynamodb.Table("pontos_fidelidade_plataforma_tcc")


def salvar_servico_finalizado(
    agendamento,
    cliente_nome,
    profissional_nome,
    estabelecimento_nome,
    servico_nome,
    tempo,
    valor,
    estabelecimento_id,
):
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
            "criado_em": datetime.utcnow().isoformat(),
        }
    )
    return response


def salvar_ponto_fidelidade(
    cliente_id,
    cliente_nome,
    estabelecimento_id,
    estabelecimento_nome,
    servico_nome,
    valor_servico,
    data_servico,
):
    response = pontos_table.put_item(
        Item={
            "pk": f"CLIENTE#{cliente_id}",
            "sk": f"PONTO#{data_servico.isoformat()}",
            "cliente_id": cliente_id,
            "cliente_nome": cliente_nome,
            "estabelecimento_id": estabelecimento_id,
            "estabelecimento_nome": estabelecimento_nome,
            "servico_realizado": servico_nome,
            "valor_servico": Decimal(str(valor_servico)),
            "pontos_ganhos": 1,
            "data_servico": data_servico.isoformat(),
            "criado_em": datetime.utcnow().isoformat(),
        }
    )
    return response


def listar_pontos_cliente(cliente_id: int):
    response = pontos_table.query(
        KeyConditionExpression="pk = :pk_val",
        ExpressionAttributeValues={":pk_val": f"CLIENTE#{cliente_id}"},
    )
    return response.get("Items", [])


def buscar_ultimo_servico_cliente(cliente_id: int):
    try:
        response = table.query(
            IndexName="cliente_id-data_fim-index",  # requer GSI com sort por data_fim
            KeyConditionExpression=Key("cliente_id").eq(cliente_id),
            ScanIndexForward=False,  # do mais recente para o mais antigo
            Limit=1,
        )
        items = response.get("Items", [])
        return items[0] if items else None
    except Exception as e:
        print(f"Erro ao buscar último serviço no DynamoDB: {e}")
        return None
