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

class AgendamentoBase(BaseModel):
    profissional_id: int
    servico_id: int
    horario: datetime

class AgendamentoCreate(AgendamentoBase):
    pass

class AgendamentoResponse(AgendamentoBase):
    id: int
    cliente_id: int  # agora aqui sim
    status: str
    criado_em: datetime

    class Config:
        from_attributes = True

class AgendamentoCanceladoResponse(BaseModel):
    id: int
    cliente_id: int
    profissional_id: int
    servico_id: int
    horario: datetime
    status: str
    criado_em: datetime
    cancelado_em: datetime

    class Config:
        from_attributes = True

class AgendaBase(BaseModel):
    profissional_id: int
    data_hora: datetime

class AgendaCreate(AgendaBase):
    pass

class AgendaResponse(AgendaBase):
    id: int
    ocupado: bool
    criado_em: datetime

    class Config:
        from_attributes = True

class ServicoBase(BaseModel):
    nome: str
    descricao: str
    preco: float

class ServicoCreate(ServicoBase):
    pass

class ServicoResponse(ServicoBase):
    id: int
    criado_em: datetime
    estabelecimento_id: int

    class Config:
        from_attributes = True
        
