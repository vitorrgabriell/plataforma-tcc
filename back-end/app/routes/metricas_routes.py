from fastapi import APIRouter, Depends
from app.utils.metricas import obter_faturamento_mensal, obter_agendamentos_por_servico
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/faturamento")
def listar_faturamento_mensal(usuario=Depends(get_current_user)):
    estabelecimento_id = usuario['estabelecimento_id']
    return obter_faturamento_mensal(estabelecimento_id)


@router.get("/servicos-agendamentos")
def listar_agendamentos_por_dia(usuario=Depends(get_current_user)):
    estabelecimento_id = usuario["estabelecimento_id"]
    return obter_agendamentos_por_servico(estabelecimento_id)
