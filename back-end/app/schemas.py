from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, func
from typing import Optional
from datetime import datetime

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

class FuncionarioBase(BaseModel):
    nome: str
    email: EmailStr
    cargo: str

class FuncionarioCreate(BaseModel):
    nome: str
    email: str
    senha: str

class FuncionarioResponse(FuncionarioBase):
    id: int
    estabelecimento_id: int

    class Config:
        from_attributes = True

class AvaliacaoBase(BaseModel):
    cliente_id: int
    profissional_id: int
    estabelecimento_id: int
    nota: int
    comentario: Optional[str] = None

class AvaliacaoCreate(AvaliacaoBase):
    pass

class AvaliacaoUpdate(BaseModel):
    nota: Optional[int] = None
    comentario: Optional[str] = None

class AvaliacaoResponse(BaseModel):
    id: int
    cliente_id: int
    profissional_id: int
    estabelecimento_id: int
    nota: int
    comentario: str | None
    criado_em: datetime

    class Config:
        from_attributes = True



