import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime
from collections import defaultdict
import os
from dotenv import load_dotenv

load_dotenv() 

def obter_faturamento_mensal(estabelecimento_id: int):
    dynamodb = boto3.resource(
    'dynamodb',
    region_name=os.getenv('AWS_REGION'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    tabela = dynamodb.Table('servicos_finalizados_plataforma_tcc')

    response = tabela.scan()
    items = response.get('Items', [])
    items.append({
    "estabelecimento_id": "1", 
    "data_inicio": "2025-02-15T10:00:00",
    "valor": 150.0
    })
    items.append({
        "estabelecimento_id": "1",
        "data_inicio": "2025-03-10T11:00:00",
        "valor": 200.0
    })

    faturamento_por_mes = defaultdict(float)

    for item in items:
        if int(item.get('estabelecimento_id', 0)) != estabelecimento_id:
            continue

        data_inicio = item.get('data_inicio')
        valor = float(item.get('valor', 0))

        data_obj = datetime.strptime(data_inicio, "%Y-%m-%dT%H:%M:%S")
        chave = f"{data_obj.year}-{data_obj.month:02d}"

        faturamento_por_mes[chave] += valor

    resultado = [{"mes": k, "faturamento": v} for k, v in sorted(faturamento_por_mes.items())]

    return resultado

def obter_agendamentos_por_dia(estabelecimento_id: int):
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=os.getenv('AWS_REGION'),
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    tabela = dynamodb.Table('servicos_finalizados_plataforma_tcc')

    response = tabela.scan()
    items = response.get('Items', [])

    agendamentos_por_dia = defaultdict(int)

    dias_semana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

    for item in items:
        if int(item.get('estabelecimento_id', 0)) != estabelecimento_id:
            continue

        horario = item.get('horario')
        if horario:
            data_obj = datetime.strptime(horario, "%Y-%m-%dT%H:%M:%S")
            dia_semana = dias_semana[data_obj.weekday()]
            agendamentos_por_dia[dia_semana] += 1

    resultado = [{"dia": k, "agendamentos": v} for k, v in agendamentos_por_dia.items()]
    return resultado

def obter_agendamentos_por_servico(estabelecimento_id: int):
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=os.getenv('AWS_REGION'),
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    tabela = dynamodb.Table('servicos_finalizados_plataforma_tcc') 

    response = tabela.scan()
    items = response.get('Items', [])

    agendamentos_por_servico = defaultdict(int)

    for item in items:
        if int(item.get('estabelecimento_id', 0)) != estabelecimento_id:
            continue

        nome_servico = item.get('servico_nome')
        if nome_servico:
            agendamentos_por_servico[nome_servico] += 1

    resultado = [{"servico": k, "agendamentos": v} for k, v in agendamentos_por_servico.items()]
    return resultado

