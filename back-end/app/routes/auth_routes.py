from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import secrets
from app.utils.security import create_access_token, verify_password
from datetime import timedelta, datetime
from app.utils.dependencies import get_current_user
from app.utils.recuperar_senha import enviar_email_recuperacao
from app.db.database import get_db
from app.schemas import Login, RecuperarSenhaRequest, ResetarSenhaRequest
from app.models.user import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login/")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/login/")
def login(user: Login, response: Response, db: Session = Depends(get_db)):
    user_db = db.execute(
        "SELECT id, nome, email, senha, tipo_usuario, estabelecimento_id FROM usuarios WHERE email = :email",
        {"email": user.email},
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
        "estabelecimento_id": user_db.estabelecimento_id,
    }

    if user_db.tipo_usuario == "profissional":
        funcionario = db.execute(
            "SELECT id FROM funcionarios WHERE usuario_id = :usuario_id",
            {"usuario_id": user_db.id},
        ).fetchone()

        if funcionario:
            payload["funcionario_id"] = funcionario.id

    access_token = create_access_token(
        data=payload, expires_delta=timedelta(minutes=30)
    )

    response.set_cookie(key="token", value=access_token, httponly=True)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "tipo_usuario": user_db.tipo_usuario,
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

    db.execute("INSERT INTO blacklist_tokens (token) VALUES (:token)", {"token": token})
    db.commit()

    return {"message": "Logout realizado com sucesso"}


@router.post("/recuperar-senha/")
def recuperar_senha(request_data: RecuperarSenhaRequest, db: Session = Depends(get_db)):
    user = db.execute(
        "SELECT id, email FROM usuarios WHERE email = :email",
        {"email": request_data.email},
    ).fetchone()

    if not user:
        return {
            "message": "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha."
        }

    token = secrets.token_urlsafe(48)
    validade = datetime.utcnow() + timedelta(hours=1)

    db.execute(
        """
        INSERT INTO tokens_recuperacao (usuario_id, token, validade)
        VALUES (:usuario_id, :token, :validade)
    """,
        {"usuario_id": user.id, "token": token, "validade": validade},
    )
    db.commit()

    enviar_email_recuperacao(user.email, token)

    return {
        "message": "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha."
    }


@router.post("/resetar-senha/")
def resetar_senha(data: ResetarSenhaRequest, db: Session = Depends(get_db)):
    token_info = db.execute(
        """
        SELECT tr.usuario_id, tr.validade
        FROM tokens_recuperacao tr
        WHERE tr.token = :token
    """,
        {"token": data.token},
    ).fetchone()

    if not token_info:
        raise HTTPException(status_code=400, detail="Token inválido.")

    if token_info.validade < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expirado.")

    nova_senha_hash = pwd_context.hash(data.nova_senha)

    db.execute(
        """
        UPDATE usuarios
        SET senha = :nova_senha
        WHERE id = :usuario_id
    """,
        {"nova_senha": nova_senha_hash, "usuario_id": token_info.usuario_id},
    )

    db.execute(
        "DELETE FROM tokens_recuperacao WHERE token = :token", {"token": data.token}
    )

    db.commit()

    return {"message": "Senha redefinida com sucesso."}
