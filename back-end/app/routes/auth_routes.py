from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.utils.security import create_access_token, verify_password
from datetime import timedelta
from app.utils.dependencies import get_current_user
from app.db.database import get_db
from app.schemas import Login
from app.models.blacklist import BlacklistToken
from app.models.funcionarios import Funcionario

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login/")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login/")
def login(user: Login, response: Response, db: Session = Depends(get_db)):
    user_db = db.execute(
        "SELECT id, nome, email, senha, tipo_usuario, estabelecimento_id FROM usuarios WHERE email = :email",
        {"email": user.email}
    ).fetchone()

    if not user_db:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if not verify_password(user.senha, user_db.senha):
        raise HTTPException(status_code=401, detail="Senha incorreta")

    payload = {
        "sub": user_db.email,
        "id": user_db.id,
        "nome": user_db.nome,
        "tipo_usuario": user_db.tipo_usuario,
        "estabelecimento_id": user_db.estabelecimento_id
    }

    if user_db.tipo_usuario == "profissional":
        funcionario = db.execute(
            "SELECT id FROM funcionarios WHERE usuario_id = :usuario_id",
            {"usuario_id": user_db.id}
        ).fetchone()

        if funcionario:
            payload["funcionario_id"] = funcionario.id

    access_token = create_access_token(
        data=payload,
        expires_delta=timedelta(minutes=30)
    )

    response.set_cookie(key="token", value=access_token, httponly=True)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "tipo_usuario": user_db.tipo_usuario
    }

@router.post("/logout/")
def logout(
    request: Request, 
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    existing_token = db.execute(
        "SELECT token FROM blacklist_tokens WHERE token = :token", {"token": token}
    ).fetchone()

    if existing_token:
        raise HTTPException(status_code=400, detail="Token já foi invalidado")

    db.execute(
        "INSERT INTO blacklist_tokens (token) VALUES (:token)", {"token": token}
    )
    db.commit()

    return {"message": "Logout realizado com sucesso"}