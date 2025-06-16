from fastapi import APIRouter, Depends, HTTPException, status, Query
import stripe
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.agendamento import Agendamento
from app.schemas import (
    AgendamentoCreate,
    AgendamentoResponse,
    AgendamentoCanceladoResponse,
    RepetirAgendamentoRequest,
)
from app.utils.dependencies import get_current_user
from datetime import datetime, timedelta
from app.models.agenda_disponivel import AgendaDisponivel
from app.models.agendamento_cancelado import AgendamentoCancelado
from app.models.servico import Servico
from app.models.user import User
from app.models.funcionarios import Funcionario
from app.models.estabelecimento import Estabelecimento
from app.models.pontos_fidelidade_cliente import PontosFidelidadeCliente
from app.models.configuracao_agenda import ConfiguracaoAgenda
from app.utils.dynamo_client import salvar_servico_finalizado, salvar_ponto_fidelidade
from app.utils.notifications import (
    enviar_email_confirmacao_agendamento,
    enviar_email_cancelamento_agendamento,
    enviar_email_mudanca_horario,
    enviar_email_mudanca_profissional,
    enviar_email_novo_agendamento_profissional,
    enviar_email_novo_agendamento_cliente,
    enviar_email_profissional_remarcou,
)

router = APIRouter()

def liberar_slots_agendamento(db, agendamento: Agendamento):
    servico = db.query(Servico).filter(Servico.id == agendamento.servico_id).first()
    if not servico:
        return

    duracao_total = timedelta(minutes=servico.tempo)
    slots_ocupados = (
        db.query(AgendaDisponivel)
        .filter(
            AgendaDisponivel.profissional_id == agendamento.profissional_id,
            AgendaDisponivel.data_hora >= agendamento.horario,
            AgendaDisponivel.data_hora < agendamento.horario + duracao_total,
            AgendaDisponivel.ocupado == True,
        )
        .all()
    )

    for slot in slots_ocupados:
        slot.ocupado = False


@router.post(
    "/", response_model=AgendamentoResponse, status_code=status.HTTP_201_CREATED
)
def criar_agendamento(
    agendamento: AgendamentoCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    servico = db.query(Servico).filter(Servico.id == agendamento.servico_id).first()
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    duracao_total = timedelta(minutes=servico.tempo)

    dia_semana = agendamento.horario.strftime("%A").lower()
    traducao_dias = {
        "monday": "segunda",
        "tuesday": "terca",
        "wednesday": "quarta",
        "thursday": "quinta",
        "friday": "sexta",
        "saturday": "sabado",
        "sunday": "domingo",
    }
    dia_semana_pt = traducao_dias.get(dia_semana)

    config = (
        db.query(ConfiguracaoAgenda)
        .filter(
            ConfiguracaoAgenda.profissional_id == agendamento.profissional_id,
            ConfiguracaoAgenda.dia_semana == dia_semana_pt,
        )
        .first()
    )

    if not config:
        raise HTTPException(
            status_code=400,
            detail="Não foi possível determinar a duração do slot para esse profissional.",
        )

    duracao_slot = timedelta(minutes=config.duracao_slot)

    slots_disponiveis = (
        db.query(AgendaDisponivel)
        .filter(
            AgendaDisponivel.profissional_id == agendamento.profissional_id,
            AgendaDisponivel.data_hora >= agendamento.horario,
            AgendaDisponivel.ocupado == False,
        )
        .all()
    )
    slots_disponiveis = list(
        {slot.data_hora: slot for slot in slots_disponiveis}.values()
    )
    slots_disponiveis.sort(key=lambda s: s.data_hora)

    slots_utilizados = []
    tempo_acumulado = timedelta()

    for slot in slots_disponiveis:
        esperado = agendamento.horario + len(slots_utilizados) * duracao_slot
        if slot.data_hora == esperado:
            slots_utilizados.append(slot)
            tempo_acumulado += duracao_slot

            if tempo_acumulado >= duracao_total:
                break
        elif slots_utilizados:
            break

    if tempo_acumulado < duracao_total:
        raise HTTPException(
            status_code=400,
            detail=f"Não há tempo disponível suficiente para esse serviço. "
            f"Apenas {tempo_acumulado.total_seconds() / 60:.0f} minutos disponíveis a partir de {agendamento.horario}, "
            f"mas o serviço exige {servico.tempo} minutos.",
        )

    profissional = (
        db.query(Funcionario)
        .filter(Funcionario.id == agendamento.profissional_id)
        .first()
    )

    novo_agendamento = Agendamento(
        cliente_id=user["id"],
        profissional_id=agendamento.profissional_id,
        servico_id=agendamento.servico_id,
        horario=agendamento.horario,
        status="pendente",
        estabelecimento_id=profissional.estabelecimento_id,
    )

    db.add(novo_agendamento)

    db.commit()
    db.refresh(novo_agendamento)

    cliente = db.query(User).filter(User.id == novo_agendamento.cliente_id).first()
    profissional = (
        db.query(Funcionario)
        .filter(Funcionario.id == novo_agendamento.profissional_id)
        .first()
    )
    servico = (
        db.query(Servico).filter(Servico.id == novo_agendamento.servico_id).first()
    )
    estabelecimento = (
        db.query(Estabelecimento)
        .filter(Estabelecimento.id == profissional.estabelecimento_id)
        .first()
    )

    if cliente and profissional and servico and estabelecimento:
        enviar_email_novo_agendamento_cliente(
            destinatario_email=cliente.email,
            nome_cliente=cliente.nome,
            nome_profissional=profissional.nome,
            nome_servico=servico.nome,
            data=novo_agendamento.horario.strftime("%d/%m/%Y"),
            horario=novo_agendamento.horario.strftime("%H:%M"),
            nome_estabelecimento=estabelecimento.nome,
        )
        enviar_email_novo_agendamento_profissional(
            destinatario_email=profissional.email,
            nome_profissional=profissional.nome,
            nome_cliente=cliente.nome,
            nome_servico=servico.nome,
            data=novo_agendamento.horario.strftime("%d/%m/%Y"),
            horario=novo_agendamento.horario.strftime("%H:%M"),
        )

    return novo_agendamento


@router.post("/{agendamento_id}/repetir", response_model=AgendamentoResponse)
def repetir_agendamento(
    agendamento_id: int,
    request: RepetirAgendamentoRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    agendamento_original = (
        db.query(Agendamento)
        .filter_by(id=agendamento_id, cliente_id=user["id"])
        .first()
    )

    if not agendamento_original:
        raise HTTPException(
            status_code=404, detail="Agendamento original não encontrado"
        )

    novo_agendamento = Agendamento(
        cliente_id=agendamento_original.cliente_id,
        profissional_id=agendamento_original.profissional_id,
        servico_id=agendamento_original.servico_id,
        horario=request.nova_data_hora,
        status="pendente",
    )
    db.add(novo_agendamento)
    db.commit()
    db.refresh(novo_agendamento)

    cliente = db.query(User).filter(User.id == novo_agendamento.cliente_id).first()
    profissional = (
        db.query(Funcionario)
        .filter(Funcionario.id == novo_agendamento.profissional_id)
        .first()
    )
    servico = (
        db.query(Servico).filter(Servico.id == novo_agendamento.servico_id).first()
    )
    estabelecimento = (
        db.query(Estabelecimento)
        .filter(Estabelecimento.id == servico.estabelecimento_id)
        .first()
    )

    enviar_email_confirmacao_agendamento(
        nome_estabelecimento=estabelecimento.nome,
        destinatario_email=cliente.email,
        nome_cliente=cliente.nome,
        nome_profissional=profissional.nome,
        nome_servico=servico.nome,
        data=novo_agendamento.horario.strftime("%d/%m/%Y"),
        horario=novo_agendamento.horario.strftime("%H:%M"),
    )

    return novo_agendamento


@router.get("/")
def listar_agendamentos_admin(
    estabelecimento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(
            status_code=403, detail="Apenas administradores podem acessar esta rota"
        )

    resultados = db.execute(
        """
        SELECT 
            u.nome as cliente, 
            f.nome as profissional, 
            s.nome as servico, 
            s.preco, 
            a.horario
        FROM agendamentos a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN funcionarios f ON f.id = a.profissional_id
        JOIN servicos s ON s.id = a.servico_id
        WHERE 
            f.estabelecimento_id = :estabelecimento_id
            AND a.status = 'confirmado'
            AND a.horario > NOW()
        ORDER BY a.horario ASC
    """,
        {"estabelecimento_id": estabelecimento_id},
    ).fetchall()

    return [dict(r) for r in resultados]


@router.get("/admin/historico")
def listar_historico_admin(
    estabelecimento_id: int,
    profissional_id: int = Query(None),
    servico_id: int = Query(None),
    periodo: str = Query(None),
    mes: str = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(
            status_code=403, detail="Apenas administradores podem acessar esta rota"
        )

    query_base = """
        SELECT 
            u.nome AS cliente,
            f.nome AS profissional,
            s.nome AS servico,
            s.preco,
            a.horario
        FROM agendamentos a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN funcionarios f ON f.id = a.profissional_id
        JOIN servicos s ON s.id = a.servico_id
        WHERE a.estabelecimento_id = :estabelecimento_id
        AND a.status = 'finalizado'
    """
    params = {"estabelecimento_id": estabelecimento_id}

    if profissional_id:
        query_base += " AND a.profissional_id = :profissional_id"
        params["profissional_id"] = profissional_id

    if servico_id:
        query_base += " AND a.servico_id = :servico_id"
        params["servico_id"] = servico_id

    if periodo:
        try:
            dias = int(periodo.replace("dias", ""))
            data_limite = datetime.now() - timedelta(days=dias)
            query_base += " AND a.horario >= :data_limite"
            params["data_limite"] = data_limite
        except:
            raise HTTPException(status_code=400, detail="Período inválido.")

    elif mes:
        try:
            ano, mes_num = map(int, mes.split("-"))
            data_inicio = datetime(ano, mes_num, 1)
            if mes_num == 12:
                data_fim = datetime(ano + 1, 1, 1)
            else:
                data_fim = datetime(ano, mes_num + 1, 1)
            query_base += " AND a.horario >= :data_inicio AND a.horario < :data_fim"
            params["data_inicio"] = data_inicio
            params["data_fim"] = data_fim
        except:
            raise HTTPException(
                status_code=400, detail="Formato de mês inválido. Use YYYY-MM."
            )

    query_base += " ORDER BY a.horario DESC"

    resultados = db.execute(query_base, params).fetchall()
    return [dict(r) for r in resultados]


@router.get("/profissional/confirmados")
def listar_agendamentos_profissional(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(
            status_code=403, detail="Apenas profissionais podem acessar esta rota"
        )

    resultados = db.execute(
        """
        SELECT 
            a.id,
            u.nome AS cliente,
            s.nome AS servico,
            s.preco,
            a.horario,
            s.tempo,
            a.status,
            c.id as cliente_id,
            u.email
        FROM agendamentos a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN servicos s ON s.id = a.servico_id
        JOIN clientes c on u.id = c.usuario_id
        WHERE a.profissional_id = :profissional_id
        AND a.status = 'confirmado'
        ORDER BY a.horario ASC
    """,
        {"profissional_id": user["funcionario_id"]},
    ).fetchall()

    return [dict(r) for r in resultados]


@router.get("/profissional/pendentes")
def listar_agendamentos_profissional(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(
            status_code=403, detail="Apenas profissionais podem acessar esta rota"
        )

    resultados = db.execute(
        """
        SELECT 
            a.id,
            u.nome AS cliente,
            s.nome AS servico,
            s.preco,
            a.horario,
            a.status,
            a.profissional_id
        FROM agendamentos a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN servicos s ON s.id = a.servico_id
        WHERE a.profissional_id = :profissional_id
        AND a.status = 'pendente'
        ORDER BY a.horario ASC
    """,
        {"profissional_id": user["funcionario_id"]},
    ).fetchall()

    return [dict(r) for r in resultados]


@router.get("/profissional/finalizados")
def listar_agendamentos_finalizados(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(
            status_code=403, detail="Apenas profissionais podem acessar esta rota"
        )

    dois_dias_atras = datetime.now() - timedelta(days=3)

    resultados = db.execute(
        """
        SELECT 
            a.id,
            u.nome AS cliente,
            s.nome AS servico,
            s.preco,
            a.horario,
            a.status
        FROM agendamentos a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN servicos s ON s.id = a.servico_id
        WHERE a.profissional_id = :prof_id
        AND a.status = 'finalizado'
        AND a.horario >= :data_limite
        ORDER BY a.horario DESC
    """,
        {"prof_id": user["funcionario_id"], "data_limite": dois_dias_atras},
    ).fetchall()

    return [dict(r) for r in resultados]


@router.get("/profissional/historico")
def listar_historico_filtrado(
    periodo: str = Query(None),
    mes: str = Query(None),
    servico_id: int = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(
            status_code=403, detail="Apenas profissionais podem acessar"
        )

    query_base = """
        SELECT 
            a.id,
            u.nome AS cliente,
            s.nome AS servico,
            s.preco,
            s.tempo,
            a.horario
        FROM agendamentos a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN servicos s ON s.id = a.servico_id
        WHERE a.profissional_id = :prof_id
        AND a.status = 'finalizado'
    """
    params = {"prof_id": user["funcionario_id"]}

    if periodo:
        dias = int(periodo.replace("dias", ""))
        data_limite = datetime.now() - timedelta(days=dias)
        query_base += " AND a.horario >= :data_limite"
        params["data_limite"] = data_limite

    elif mes:
        try:
            ano, mes_num = map(int, mes.split("-"))
            data_inicio = datetime(ano, mes_num, 1)
            if mes_num == 12:
                data_fim = datetime(ano + 1, 1, 1)
            else:
                data_fim = datetime(ano, mes_num + 1, 1)
            query_base += " AND a.horario >= :data_inicio AND a.horario < :data_fim"
            params["data_inicio"] = data_inicio
            params["data_fim"] = data_fim
        except:
            raise HTTPException(
                status_code=400, detail="Formato de mês inválido. Use YYYY-MM."
            )

    if servico_id:
        query_base += " AND a.servico_id = :servico_id"
        params["servico_id"] = servico_id

    query_base += " ORDER BY a.horario DESC"

    resultados = db.execute(query_base, params).fetchall()
    return [dict(r) for r in resultados]


@router.get("/cancelados")
def listar_agendamentos_cancelados(
    estabelecimento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(
            status_code=403, detail="Apenas administradores podem acessar"
        )

    resultados = db.execute(
        """
        SELECT 
            a.id,
            u.nome AS cliente,
            f.nome AS profissional,
            s.nome AS servico,
            s.preco,
            a.horario,
            a.cancelado_em
        FROM agendamentos_cancelados a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN funcionarios f ON f.id = a.profissional_id
        JOIN servicos s ON s.id = a.servico_id
        WHERE 
            f.estabelecimento_id = :estabelecimento_id
            AND a.cancelado_por = 'cliente'
            AND a.horario > NOW()
        ORDER BY a.cancelado_em DESC
    """,
        {"estabelecimento_id": estabelecimento_id},
    ).fetchall()

    return [dict(r) for r in resultados]


@router.get("/meus-cancelados", response_model=list[AgendamentoCanceladoResponse])
def listar_cancelamentos_cliente(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    return (
        db.query(AgendamentoCancelado)
        .filter(AgendamentoCancelado.cliente_id == user["id"])
        .all()
    )


@router.get("/meus", response_model=list[dict])
def listar_meus_agendamentos(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    sql = text(
        """
    SELECT 
        a.id,
        a.servico_id,
        a.profissional_id,
        s.nome AS servico,
        f.nome AS profissional,
        e.nome as estabelecimento,
        a.horario,
        a.status,
        CASE WHEN av.id IS NOT NULL THEN true ELSE false END AS avaliado
    FROM agendamentos a
    JOIN usuarios u ON u.id = a.cliente_id 
    JOIN servicos s ON s.id = a.servico_id 
    JOIN funcionarios f ON f.id = a.profissional_id
    JOIN estabelecimentos e on e.id = a.estabelecimento_id
    LEFT JOIN avaliacoes av ON av.agendamento_id = a.id
    WHERE a.cliente_id = :cliente_id
    ORDER BY a.id DESC
    """
    )

    result = db.execute(sql, {"cliente_id": user["id"]}).fetchall()

    return [
        {
            "id": row.id,
            "servico_id": row.servico_id,
            "profissional_id": row.profissional_id,
            "servico": row.servico,
            "profissional": row.profissional,
            "estabelecimento": row.estabelecimento,
            "horario": row.horario,
            "status": row.status,
            "avaliado": row.avaliado,
        }
        for row in result
    ]


@router.get("/meus-finalizados", response_model=list[dict])
def listar_meus_agendamentos(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    sql = text(
        """
    SELECT 
        a.id,
        a.servico_id,
        a.profissional_id,
        s.nome AS servico,
        f.nome AS profissional,
        a.horario,
        a.status,
        CASE WHEN av.id IS NOT NULL THEN true ELSE false END AS avaliado
    FROM agendamentos a
    JOIN usuarios u ON u.id = a.cliente_id 
    JOIN servicos s ON s.id = a.servico_id 
    JOIN funcionarios f ON f.id = a.profissional_id
    LEFT JOIN avaliacoes av ON av.agendamento_id = a.id
    WHERE a.cliente_id = :cliente_id
    and a.status = 'finalizado'
    ORDER BY a.id DESC
    """
    )

    result = db.execute(sql, {"cliente_id": user["id"]}).fetchall()

    return [
        {
            "id": row.id,
            "servico_id": row.servico_id,
            "profissional_id": row.profissional_id,
            "servico": row.servico,
            "profissional": row.profissional,
            "horario": row.horario,
            "status": row.status,
            "avaliado": row.avaliado,
        }
        for row in result
    ]


@router.put("/editar/{agendamento_id}", response_model=AgendamentoResponse)
def editar_agendamento(
    agendamento_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if user["tipo_usuario"] == "cliente" and agendamento.cliente_id != user["id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    elif user["tipo_usuario"] == "profissional":
        if agendamento.profissional_id != user["funcionario_id"]:
            raise HTTPException(status_code=403, detail="Acesso negado.")
        if agendamento.status != "pendente":
            raise HTTPException(
                status_code=400,
                detail="Apenas agendamentos pendentes podem ser remarcados pelo profissional.",
            )

    novo_horario = (
        db.query(AgendaDisponivel)
        .filter(
            AgendaDisponivel.id == payload["horario_id"],
            AgendaDisponivel.ocupado == False,
        )
        .first()
    )

    if not novo_horario:
        raise HTTPException(status_code=400, detail="Horário indisponível.")

    data_antiga = agendamento.horario
    profissional_antigo_id = agendamento.profissional_id

    liberar_slots_agendamento(db, agendamento)

    if "profissional_id" in payload:
        novo_profissional_id = int(payload["profissional_id"])
        if novo_profissional_id != agendamento.profissional_id:
            agendamento.profissional_id = novo_profissional_id

    agendamento.horario = novo_horario.data_hora

    servico = db.query(Servico).filter(Servico.id == agendamento.servico_id).first()
    if servico:
        duracao_total = timedelta(minutes=servico.tempo)
        inicio = agendamento.horario
        fim = inicio + duracao_total

        novos_slots = (
            db.query(AgendaDisponivel)
            .filter(
                AgendaDisponivel.profissional_id == agendamento.profissional_id,
                AgendaDisponivel.data_hora >= inicio,
                AgendaDisponivel.data_hora < fim,
            )
            .all()
        )

        for slot in novos_slots:
            slot.ocupado = False

    agendamento.status = "pendente"
    db.commit()
    db.refresh(agendamento)

    cliente = db.query(User).filter(User.id == agendamento.cliente_id).first()
    servico = db.query(Servico).filter(Servico.id == agendamento.servico_id).first()
    profissional = (
        db.query(Funcionario)
        .filter(Funcionario.id == agendamento.profissional_id)
        .first()
    )

    if profissional_antigo_id != agendamento.profissional_id:
        antigo_profissional = (
            db.query(Funcionario)
            .filter(Funcionario.id == profissional_antigo_id)
            .first()
        )
        novo_profissional = profissional

        if antigo_profissional and cliente and servico:
            enviar_email_mudanca_profissional(
                destinatario_email=antigo_profissional.email,
                nome_profissional=antigo_profissional.nome,
                nome_cliente=cliente.nome,
                nome_servico=servico.nome,
            )

        if novo_profissional and cliente and servico:
            enviar_email_novo_agendamento_profissional(
                destinatario_email=novo_profissional.email,
                nome_cliente=cliente.nome,
                nome_profissional=novo_profissional.nome,
                nome_servico=servico.nome,
                data=agendamento.horario.strftime("%d/%m/%Y"),
                horario=agendamento.horario.strftime("%H:%M"),
            )

    elif data_antiga != agendamento.horario:
        if user["tipo_usuario"] == "cliente":
            if profissional and cliente and servico:
                enviar_email_mudanca_horario(
                    destinatario_email=profissional.email,
                    nome_profissional=profissional.nome,
                    nome_cliente=cliente.nome,
                    nome_servico=servico.nome,
                    nova_data=agendamento.horario.strftime("%d/%m/%Y"),
                    novo_horario=agendamento.horario.strftime("%H:%M"),
                )
        elif user["tipo_usuario"] == "profissional":
            if cliente and profissional and servico:
                enviar_email_profissional_remarcou(
                    destinatario_email=cliente.email,
                    nome_cliente=cliente.nome,
                    nome_profissional=profissional.nome,
                    nome_servico=servico.nome,
                    nova_data=agendamento.horario.strftime("%d/%m/%Y"),
                    novo_horario=agendamento.horario.strftime("%H:%M"),
                )

    return agendamento


@router.put("/confirmar/{agendamento_id}")
def confirmar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(
            status_code=403, detail="Apenas profissionais podem confirmar agendamentos."
        )

    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if agendamento.profissional_id != user["funcionario_id"]:
        raise HTTPException(
            status_code=403, detail="Você só pode confirmar seus próprios agendamentos."
        )

    if agendamento.status == "confirmado":
        raise HTTPException(status_code=400, detail="Agendamento já está confirmado.")

    servico = db.query(Servico).filter(Servico.id == agendamento.servico_id).first()
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    duracao_total = timedelta(minutes=servico.tempo)

    slots_disponiveis = (
        db.query(AgendaDisponivel)
        .filter(
            AgendaDisponivel.profissional_id == agendamento.profissional_id,
            AgendaDisponivel.data_hora >= agendamento.horario,
        )
        .order_by(AgendaDisponivel.data_hora)
        .all()
    )

    slots_utilizados = []
    tempo_acumulado = timedelta()

    for slot in slots_disponiveis:
        if not slots_utilizados:
            if slot.data_hora != agendamento.horario:
                continue
        else:
            anterior = slots_utilizados[-1].data_hora
            if slot.data_hora != anterior + timedelta(minutes=15):
                break

        if slot.ocupado:
            raise HTTPException(
                status_code=400,
                detail="Horários conflitantes — não é possível confirmar.",
            )

        slots_utilizados.append(slot)
        tempo_acumulado += timedelta(minutes=15)
        if tempo_acumulado >= duracao_total:
            break

    for slot in slots_utilizados:
        slot.ocupado = True

    agendamento.status = "confirmado"
    db.commit()

    cliente = db.query(User).filter(User.id == agendamento.cliente_id).first()
    profissional = (
        db.query(Funcionario)
        .filter(Funcionario.id == agendamento.profissional_id)
        .first()
    )
    estabelecimento = (
        db.query(Estabelecimento)
        .filter(Estabelecimento.id == profissional.estabelecimento_id)
        .first()
    )

    if cliente and profissional and servico:
        enviar_email_confirmacao_agendamento(
            nome_estabelecimento=estabelecimento.nome,
            destinatario_email=cliente.email,
            nome_cliente=cliente.nome,
            nome_profissional=profissional.nome,
            nome_servico=servico.nome,
            data=agendamento.horario.strftime("%d/%m/%Y"),
            horario=agendamento.horario.strftime("%H:%M"),
        )

    return {"message": "Agendamento confirmado com sucesso!"}


@router.put("/recusar/{agendamento_id}")
def recusar_agendamento(
    agendamento_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(
            status_code=403, detail="Apenas profissionais podem recusar agendamentos."
        )

    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if agendamento.profissional_id != user["funcionario_id"]:
        raise HTTPException(
            status_code=403, detail="Você só pode recusar seus próprios agendamentos."
        )

    if agendamento.status != "pendente":
        raise HTTPException(
            status_code=400, detail="Só é possível recusar agendamentos pendentes."
        )

    liberar_slots_agendamento(db, agendamento)

    agendamento.status = "recusado"
    db.commit()

    return {"message": "Agendamento recusado com sucesso!"}


@router.delete("/{agendamento_id}", status_code=status.HTTP_200_OK)
def cancelar_agendamento(
    agendamento_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if user["tipo_usuario"] == "cliente":
        if agendamento.cliente_id != user["id"]:
            raise HTTPException(
                status_code=403,
                detail="Você não tem permissão para cancelar este agendamento.",
            )
        cancelado_por = "cliente"

    elif user["tipo_usuario"] == "profissional":
        if agendamento.profissional_id != user["funcionario_id"]:
            raise HTTPException(
                status_code=403,
                detail="Você não tem permissão para cancelar este agendamento.",
            )
        cancelado_por = "profissional"

    elif user["tipo_usuario"] == "admin":
        cancelado_por = "admin"
    else:
        raise HTTPException(status_code=403, detail="Tipo de usuário não autorizado.")

    liberar_slots_agendamento(db, agendamento)

    agendamento_cancelado = AgendamentoCancelado(
        id=agendamento.id,
        cliente_id=agendamento.cliente_id,
        profissional_id=agendamento.profissional_id,
        servico_id=agendamento.servico_id,
        status=agendamento.status,
        horario=agendamento.horario,
        criado_em=agendamento.criado_em,
        cancelado_em=datetime.utcnow(),
        cancelado_por=cancelado_por,
    )

    db.add(agendamento_cancelado)
    db.delete(agendamento)
    db.commit()

    if cancelado_por == "cliente":
        cliente = db.query(User).filter(User.id == agendamento.cliente_id).first()
        profissional = (
            db.query(Funcionario)
            .filter(Funcionario.id == agendamento.profissional_id)
            .first()
        )
        servico = db.query(Servico).filter(Servico.id == agendamento.servico_id).first()

        if cliente and profissional and servico:
            enviar_email_cancelamento_agendamento(
                destinatario_email=profissional.email,
                nome_profissional=profissional.nome,
                nome_cliente=cliente.nome,
                nome_servico=servico.nome,
                data=agendamento.horario.strftime("%d/%m/%Y"),
                horario=agendamento.horario.strftime("%H:%M"),
                motivo="Cancelado diretamente pelo cliente via plataforma",
            )

    return {"message": "Agendamento cancelado com sucesso!"}


@router.put("/finalizar/{agendamento_id}")
def finalizar_agendamento(
    agendamento_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(
            status_code=403, detail="Apenas profissionais podem finalizar agendamentos."
        )

    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if agendamento.profissional_id != user["funcionario_id"]:
        raise HTTPException(
            status_code=403, detail="Você só pode finalizar seus próprios agendamentos."
        )

    if agendamento.status != "confirmado":
        raise HTTPException(
            status_code=400, detail="Só é possível finalizar agendamentos confirmados."
        )

    agendamento.status = "finalizado"

    servico = db.query(Servico).filter(Servico.id == agendamento.servico_id).first()
    cliente = db.query(User).filter(User.id == agendamento.cliente_id).first()
    profissional = (
        db.query(Funcionario)
        .filter(Funcionario.id == agendamento.profissional_id)
        .first()
    )
    estabelecimento_nome = (
        profissional.estabelecimento.nome
        if profissional and profissional.estabelecimento
        else "Desconhecido"
    )

    salvar_servico_finalizado(
        agendamento=agendamento,
        cliente_nome=cliente.nome,
        profissional_nome=profissional.nome,
        estabelecimento_nome=estabelecimento_nome,
        servico_nome=servico.nome,
        tempo=servico.tempo,
        valor=servico.preco,
        estabelecimento_id=profissional.estabelecimento_id,
    )

    salvar_ponto_fidelidade(
        cliente_id=cliente.id,
        cliente_nome=cliente.nome,
        estabelecimento_id=profissional.estabelecimento_id,
        estabelecimento_nome=estabelecimento_nome,
        servico_nome=servico.nome,
        valor_servico=servico.preco,
        data_servico=agendamento.horario,
    )

    try:
        stripe.PaymentIntent.create(
            amount=int(servico.preco * 100),
            currency="brl",
            receipt_email=cliente.email,
            metadata={
                "descricao": f"Pagamento de serviço '{servico.nome}' no AgendaVip"
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao realizar cobrança: {str(e)}"
        )

    if cliente and cliente.tipo_usuario == "cliente":
        registro_pontos = (
            db.query(PontosFidelidadeCliente)
            .filter_by(
                cliente_id=cliente.id,
                estabelecimento_id=profissional.estabelecimento_id,
            )
            .first()
        )

        if registro_pontos:
            registro_pontos.pontos_acumulados += 1
            registro_pontos.atualizado_em = datetime.utcnow()
        else:
            registro_pontos = PontosFidelidadeCliente(
                cliente_id=cliente.id,
                estabelecimento_id=profissional.estabelecimento_id,
                pontos_acumulados=1,
            )
            db.add(registro_pontos)

    db.commit()

    return {
        "message": "Agendamento finalizado e ponto de fidelidade acumulado com sucesso!"
    }
