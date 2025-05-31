from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.avaliacao import Avaliacao
from app.schemas import (
    AvaliacaoCreate,
    AvaliacaoResponse,
    AvaliacaoUpdate,
    AvaliacaoPublicaResponse,
)

router = APIRouter()


@router.get("/", response_model=List[AvaliacaoPublicaResponse])
def listar_avaliacoes_com_nomes(estabelecimento_id: int, db: Session = Depends(get_db)):
    resultados = (
        db.execute(
            """
        SELECT 
            u.nome AS cliente, 
            e.nome AS estabelecimento, 
            a.comentario,
            a.nota
        FROM avaliacoes a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN estabelecimentos e ON e.id = a.estabelecimento_id
        WHERE a.estabelecimento_id = :estabelecimento_id
        ORDER BY a.criado_em DESC
        LIMIT 10
    """,
            {"estabelecimento_id": estabelecimento_id},
        )
        .mappings()
        .all()
    )

    return resultados


@router.get("/publicas", response_model=List[AvaliacaoPublicaResponse])
def listar_avaliacoes_publicas(db: Session = Depends(get_db)):
    resultados = (
        db.execute(
            """
        SELECT 
            u.nome AS cliente, 
            e.nome AS estabelecimento, 
            a.comentario,
            a.nota
        FROM avaliacoes a
        JOIN usuarios u ON u.id = a.cliente_id
        JOIN estabelecimentos e ON e.id = a.estabelecimento_id
        ORDER BY a.criado_em DESC
        LIMIT 5
    """
        )
        .mappings()
        .all()
    )

    return resultados


@router.get("/{id}", response_model=AvaliacaoResponse)
def obter_avaliacao(
    id: int, estabelecimento_id: int = None, db: Session = Depends(get_db)
):
    avaliacao = db.query(Avaliacao).filter(Avaliacao.id == id).first()
    if not avaliacao or (
        estabelecimento_id and avaliacao.estabelecimento_id != estabelecimento_id
    ):
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    return avaliacao


@router.post("/", response_model=AvaliacaoResponse, status_code=201)
def criar_avaliacao(avaliacao: AvaliacaoCreate, db: Session = Depends(get_db)):
    nova_avaliacao = Avaliacao(**avaliacao.dict())
    db.add(nova_avaliacao)
    db.commit()
    db.refresh(nova_avaliacao)
    return nova_avaliacao


@router.put("/{id}", response_model=AvaliacaoResponse)
def atualizar_avaliacao(id: int, dados: AvaliacaoUpdate, db: Session = Depends(get_db)):
    avaliacao = db.query(Avaliacao).filter(Avaliacao.id == id).first()
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")

    for campo, valor in dados.dict(exclude_unset=True).items():
        setattr(avaliacao, campo, valor)

    db.commit()
    db.refresh(avaliacao)
    return avaliacao


@router.delete("/{id}", status_code=204)
def deletar_avaliacao(id: int, db: Session = Depends(get_db)):
    avaliacao = db.query(Avaliacao).filter(Avaliacao.id == id).first()
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    db.delete(avaliacao)
    db.commit()
    return
