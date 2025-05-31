from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.utils.dependencies import get_current_user
from app.schemas import (
    EstabelecimentoCreate,
    EstabelecimentoResponse,
    EstabelecimentoUpdate,
)
from app.models.estabelecimento import Estabelecimento

router = APIRouter()


@router.post("/")
def cadastrar_estabelecimento(
    estabelecimento: EstabelecimentoCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.execute(
        """
        INSERT INTO estabelecimentos (nome, cnpj, tipo_servico)
        VALUES (:nome, :cnpj, :tipo_servico)
        """,
        {
            "nome": estabelecimento.nome,
            "cnpj": estabelecimento.cnpj,
            "tipo_servico": estabelecimento.tipo_servico,
        },
    )
    db.commit()

    estabelecimento_db = db.execute(
        "SELECT id FROM estabelecimentos WHERE cnpj = :cnpj",
        {"cnpj": estabelecimento.cnpj},
    ).fetchone()

    if not estabelecimento_db:
        raise HTTPException(status_code=500, detail="Erro ao criar o estabelecimento.")

    db.execute(
        """
        UPDATE usuarios
        SET tipo_usuario = 'admin', estabelecimento_id = :estabelecimento_id
        WHERE id = :user_id
        """,
        {"estabelecimento_id": estabelecimento_db.id, "user_id": user["id"]},
    )
    db.commit()

    return {"message": "Estabelecimento cadastrado e usuário atualizado!"}


@router.get("/", response_model=list[EstabelecimentoResponse])
def listar_estabelecimentos(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    return db.query(Estabelecimento).order_by(Estabelecimento.id.asc()).all()


@router.get("/{id}", response_model=EstabelecimentoResponse)
def get_estabelecimento(id: int, db: Session = Depends(get_db)):
    estabelecimento = db.query(Estabelecimento).filter(Estabelecimento.id == id).first()

    if not estabelecimento:
        raise HTTPException(status_code=404, detail="Estabelecimento não encontrado")

    return estabelecimento


@router.put("/{id}")
def update_estabelecimento(
    id: int,
    est: EstabelecimentoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user["estabelecimento_id"] != id:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para editar este estabelecimento",
        )

    estabelecimento = db.query(Estabelecimento).filter(Estabelecimento.id == id).first()

    if not estabelecimento:
        raise HTTPException(status_code=404, detail="Estabelecimento não encontrado")

    estabelecimento.nome = est.nome
    estabelecimento.cnpj = est.cnpj
    estabelecimento.tipo_servico = est.tipo_servico

    db.commit()
    db.refresh(estabelecimento)

    return {"message": "Estabelecimento atualizado com sucesso"}
