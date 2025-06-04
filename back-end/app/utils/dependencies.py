from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.blacklist import BlacklistToken
from app.utils.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login/")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    blacklisted_token = db.execute(
        "SELECT id FROM blacklist_tokens WHERE token = :token", {"token": token}
    ).fetchone()

    if blacklisted_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido"
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_email: str = payload.get("sub")
        user_id: int = payload.get("id")
        user_role: str = payload.get("tipo_usuario")
        estabelecimento_id: int = payload.get("estabelecimento_id")
        funcionario_id: int = payload.get("funcionario_id")

        if user_email is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido"
            )

        user_data = {
            "email": user_email,
            "id": user_id,
            "tipo_usuario": user_role,
            "estabelecimento_id": estabelecimento_id,
        }
        if user_role == "profissional":
            user_data["funcionario_id"] = funcionario_id

        return user_data

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido"
        )
