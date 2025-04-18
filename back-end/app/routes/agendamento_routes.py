from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.agendamento import Agendamento
from app.schemas import AgendamentoCreate, AgendamentoResponse, AgendamentoCanceladoResponse
from app.utils.dependencies import get_current_user
from datetime import datetime
from app.models.agenda_disponivel import AgendaDisponivel
from app.models.agendamento_cancelado import AgendamentoCancelado

router = APIRouter()

@router.post("/", response_model=AgendamentoResponse, status_code=status.HTTP_201_CREATED)
def criar_agendamento(
    agendamento: AgendamentoCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    horario_disponivel = db.query(AgendaDisponivel).filter(
        AgendaDisponivel.profissional_id == agendamento.profissional_id,
        AgendaDisponivel.data_hora == agendamento.horario,
        AgendaDisponivel.ocupado == False
    ).first()

    if not horario_disponivel:
        raise HTTPException(
            status_code=400,
            detail="Horário não está disponível para esse profissional."
        )

    novo_agendamento = Agendamento(
    cliente_id=user["id"], 
    profissional_id=agendamento.profissional_id,
    servico_id=agendamento.servico_id,
    horario=agendamento.horario,
    status="pendente"
    )
    db.add(novo_agendamento)

    horario_disponivel.ocupado = True
    db.commit()
    db.refresh(novo_agendamento)

    return novo_agendamento

@router.get("/")
def listar_agendamentos_admin(
    estabelecimento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar esta rota")

    resultados = db.execute("""
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
        WHERE f.estabelecimento_id = :estabelecimento_id
    """, {"estabelecimento_id": estabelecimento_id}).fetchall()

    return [dict(r) for r in resultados]

@router.get("/profissional")
def listar_agendamentos_profissional(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(status_code=403, detail="Apenas profissionais podem acessar esta rota")

    resultados = db.execute("""
        SELECT 
            a.id,
            u.nome AS cliente,
            s.nome AS servico,
            s.preco,
            a.horario,
            a.status,
            CASE 
                WHEN a.status = 'confirmado' THEN true
                ELSE false
            END AS confirmado
        FROM agendamentos a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN servicos s ON s.id = a.servico_id
        WHERE a.profissional_id = :profissional_id
        ORDER BY a.horario ASC
    """, {"profissional_id": user["id"]}).fetchall()

    return [dict(r) for r in resultados]

@router.get("/cancelados")
def listar_agendamentos_cancelados(estabelecimento_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["tipo_usuario"] != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    resultados = db.execute("""
        SELECT 
            a.id,
            u.nome AS cliente,
            f.nome AS profissional,
            s.nome AS servico,
            s.preco,
            ag.horario,
            a.cancelado_em
        FROM agendamentos_cancelados a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN funcionarios f ON f.id = a.profissional_id
        JOIN servicos s ON s.id = a.servico_id
        JOIN agendamentos ag on s.id = a.id
        WHERE f.estabelecimento_id = :estabelecimento_id
        ORDER BY a.cancelado_em DESC
    """, {"estabelecimento_id": estabelecimento_id}).fetchall()

    return [dict(r) for r in resultados]

@router.get("/meus-cancelados", response_model=list[AgendamentoCanceladoResponse])
def listar_cancelamentos_cliente(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(AgendamentoCancelado).filter(AgendamentoCancelado.cliente_id == user["id"]).all()

@router.get("/meus", response_model=list[AgendamentoResponse])
def listar_meus_agendamentos(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Agendamento).filter(Agendamento.cliente_id == user["id"]).all()

@router.put("/editar/{agendamento_id}", response_model=AgendamentoResponse)
def editar_agendamento(
    agendamento_id: int,
    payload: dict,  # espera { "horario_id": int }
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if agendamento.cliente_id != user["id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")

    novo_horario = db.query(AgendaDisponivel).filter(
        AgendaDisponivel.id == payload["horario_id"],
        AgendaDisponivel.ocupado == False
    ).first()

    if not novo_horario:
        raise HTTPException(status_code=400, detail="Horário indisponível.")

    # Liberar horário antigo
    horario_antigo = db.query(AgendaDisponivel).filter(
        AgendaDisponivel.profissional_id == agendamento.profissional_id,
        AgendaDisponivel.data_hora == agendamento.horario
    ).first()
    if horario_antigo:
        horario_antigo.ocupado = False

    # Atualizar agendamento
    agendamento.horario = novo_horario.data_hora
    novo_horario.ocupado = True

    db.commit()
    db.refresh(agendamento)
    return agendamento

@router.put("/confirmar/{agendamento_id}")
def confirmar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["tipo_usuario"] != "profissional":
        raise HTTPException(status_code=403, detail="Apenas profissionais podem confirmar agendamentos.")

    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if agendamento.profissional_id != user["id"]:
        raise HTTPException(status_code=403, detail="Você só pode confirmar seus próprios agendamentos.")

    if agendamento.status == "confirmado":
        raise HTTPException(status_code=400, detail="Agendamento já está confirmado.")

    agendamento.status = "confirmado"
    db.commit()

    return {"message": "Agendamento confirmado com sucesso!"}


@router.delete("/{agendamento_id}", status_code=status.HTTP_200_OK)
def cancelar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if agendamento.cliente_id != user["id"] and user["tipo_usuario"] != "admin":
        raise HTTPException(status_code=403, detail="Você não tem permissão para cancelar este agendamento.")

    horario = db.query(AgendaDisponivel).filter(
    AgendaDisponivel.profissional_id == agendamento.profissional_id,
    AgendaDisponivel.data_hora == agendamento.horario
    ).first()

    if horario:
        horario.ocupado = False

    db.delete(agendamento)
    db.commit()

    return {"message": "Agendamento cancelado com sucesso!"}
