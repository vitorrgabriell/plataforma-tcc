from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, func
from typing import Optional, List
from datetime import datetime, date, time

class EstabelecimentoBase(BaseModel):
    nome: str
    cnpj: str
    tipo_servico: str 

class EstabelecimentoCreate(EstabelecimentoBase):
    pass

class EstabelecimentoUpdate(BaseModel):
    nome: str
    cnpj: str
    tipo_servico: str

class EstabelecimentoResponse(BaseModel):
    id: int
    nome: str
    cnpj: str
    tipo_servico: str

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
    pontos_acumulados: int

class UpdateUser(BaseModel):
    nome: str
    email: EmailStr
    tipo_usuario: str
    senha: Optional[str] = None


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

class FuncionarioUpdate(BaseModel):
    nome: str
    email: str
    senha: Optional[str] = None

class FuncionarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    cargo: str | None = None  # se tiver esse campo
    estabelecimento_id: int

    class Config:
        orm_mode = True

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

class AvaliacaoPublicaResponse(BaseModel):
    cliente: str
    estabelecimento: str
    comentario: str
    nota: int

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

class AgendamentoUpdate(BaseModel):
    horario_id: int

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

class AgendaCreate(BaseModel):
    profissional_id: int
    estabelecimento_id: int
    data_inicio: date
    data_fim: date
    dias_semana: list[int]
    horario_inicio: time
    horario_fim: time

class AgendaResponse(AgendaBase):
    id: int
    ocupado: bool
    criado_em: datetime

    class Config:
        from_attributes = True

class GerarAgendaRequest(BaseModel):
    profissional_id: int
    data_inicial: str
    semana_toda: bool
    usar_padrao: bool
    horarios_personalizados: list[str]
    duracao_minutos: int

class GerarAgendaAdminRequest(BaseModel):
    data_inicio: str
    data_fim: str
    dias_semana: list[int]
    horario_inicio: str
    horario_fim: str
    duracao_minutos: int

class ConfiguracaoAgendaCreate(BaseModel):
    profissional_id: int
    dia_semana: str
    hora_inicio: str
    hora_fim: str
    duracao_slot: int = 30

class ConfiguracaoAgendaUpdate(BaseModel):
    hora_inicio: str
    hora_fim: str
    duracao_slot: int = 30

class ConfiguracaoAgendaResponse(BaseModel):
    id: int
    profissional_id: int
    dia_semana: str
    hora_inicio: str
    hora_fim: str
    duracao_slot: int

    class Config:
        orm_mode = True

class ServicoBase(BaseModel):
    nome: str
    descricao: str
    preco: float
    tempo: int  # novo campo (em minutos)

class ServicoCreate(ServicoBase):
    pass

class ServicoUpdate(ServicoBase):
    pass

class ServicoResponse(ServicoBase):
    id: int
    criado_em: datetime
    estabelecimento_id: int

    class Config:
        orm_mode = True
    
class ProgramaFidelidadeBase(BaseModel):
    descricao_premio: str
    pontos_necessarios: int

class ProgramaFidelidadeCreate(BaseModel):
    estabelecimento_id: int
    descricao_premio: str
    pontos_necessarios: int
    ativo: bool = True

class ProgramaFidelidadeUpdate(BaseModel):
    descricao_premio: str
    pontos_necessarios: int
    ativo: bool

class ProgramaFidelidadeResponse(ProgramaFidelidadeBase):
    id: int
    estabelecimento_id: int
    criado_em: datetime
    ativo: bool

    class Config:
        orm_mode = True

class ResgateFidelidadeBase(BaseModel):
    cliente_id: int
    programa_fidelidade_id: int

class ResgateFidelidadeCreate(ResgateFidelidadeBase):
    pass

class ResgateFidelidadeResponse(ResgateFidelidadeBase):
    id: int
    data_resgate: datetime

    class Config:
        orm_mode = True

        
