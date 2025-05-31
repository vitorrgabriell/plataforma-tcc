from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.db.database import get_db
from app.utils.security import get_password_hash
from app.utils.dependencies import get_current_user
from app.schemas import UserResponse, UpdateUser, RegisterUser

router = APIRouter()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/")
def register(user: RegisterUser, db: Session = Depends(get_db)):
    user = user.dict()

    if user["tipo_usuario"] != "cliente" and not user["estabelecimento_id"]:
        raise HTTPException(
            status_code=400,
            detail="Estabelecimento ID é obrigatório para este tipo de usuário",
        )

    if user["estabelecimento_id"]:
        estabelecimento = db.execute(
            "SELECT id FROM estabelecimentos WHERE id = :id",
            {"id": user["estabelecimento_id"]},
        ).fetchone()

        if not estabelecimento:
            raise HTTPException(
                status_code=404, detail="Estabelecimento não encontrado"
            )

    existing_user = db.execute(
        "SELECT * FROM usuarios WHERE email = :email", {"email": user["email"]}
    ).fetchone()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email já está em uso")

    hashed_password = get_password_hash(user["senha"])

    db.execute(
        """
        INSERT INTO usuarios (nome, email, senha, tipo_usuario, estabelecimento_id)
        VALUES (:nome, :email, :senha, :tipo_usuario, :estabelecimento_id)
        """,
        {
            "nome": user["nome"],
            "email": user["email"],
            "senha": hashed_password,
            "tipo_usuario": user["tipo_usuario"],
            "estabelecimento_id": user["estabelecimento_id"],
        },
    )
    db.commit()

    return {"message": "Usuário registrado com sucesso"}


@router.get("/", dependencies=[Depends(get_current_user)])
def get_users(db: Session = Depends(get_db), user=Depends(get_current_user)):
    users = db.execute(
        "SELECT id, nome, email, tipo_usuario FROM usuarios WHERE estabelecimento_id = :estabelecimento_id",
        {"estabelecimento_id": user["estabelecimento_id"]},
    ).fetchall()
    if user["estabelecimento_id"] == None:
        return "Estabelecimento id vazio"
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.execute(
        "SELECT id, nome, email, tipo_usuario FROM usuarios WHERE id = :id",
        {"id": user_id},
    ).fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return user


@router.put("/{user_id}")
def update_user(user_id: int, user: UpdateUser, db: Session = Depends(get_db)):
    user_db = db.execute(
        "SELECT * FROM usuarios WHERE id = :id", {"id": user_id}
    ).fetchone()

    if not user_db:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    db.execute(
        """
        UPDATE usuarios SET nome = :nome, email = :email, tipo_usuario = :tipo_usuario WHERE id = :id
        """,
        {
            "id": user_id,
            "nome": user.nome,
            "email": user.email,
            "tipo_usuario": user["tipo_usuario"],
        },
    )
    if user.senha:
        hashed_password = get_password_hash(user.senha)
        db.execute(
            "UPDATE usuarios SET senha = :senha WHERE id = :id",
            {"senha": hashed_password, "id": user_id},
        )
    db.commit()

    return {"message": "Usuário atualizado com sucesso"}


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user_db = db.execute(
        "SELECT * FROM usuarios WHERE id = :id", {"id": user_id}
    ).fetchone()

    if not user_db:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    db.execute("DELETE FROM usuarios WHERE id = :id", {"id": user_id})
    db.commit()

    return {"message": "Usuário deletado com sucesso"}
