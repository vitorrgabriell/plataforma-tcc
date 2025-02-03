from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db

router = APIRouter()

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return {"message": "Aqui você retornará os usuários do banco"}
