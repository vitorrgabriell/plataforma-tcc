from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.utils.dependencies import get_current_user
from app.schemas import EstabelecimentoCreate

router = APIRouter()

@router.post("/estabelecimentos/")
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
