from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, func
from typing import Optional

class EstabelecimentoBase(BaseModel):
    nome: str
    cnpj: str
    tipo_servico: str 

class EstabelecimentoCreate(EstabelecimentoBase):
    pass

class EstabelecimentoResponse(EstabelecimentoBase):
    id: int

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    tipo_usuario: str
    estabelecimento_id: int

class UserResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    tipo_usuario: str

class UpdateUser(BaseModel):
    nome: str
    email: EmailStr
    tipo_usuario: str

class Config:
    orm_mode = True

class RegisterUser(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    tipo_usuario: str
    estabelecimento_id: Optional[int] = None

class Login(BaseModel):
    email: EmailStr
    senha: str

class BlacklistTokenSchema(BaseModel):
    token: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
