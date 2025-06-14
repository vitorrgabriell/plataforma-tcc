from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.database import Base


class Estabelecimento(Base):
    __tablename__ = "estabelecimentos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    cnpj = Column(String, unique=True, nullable=False)
    tipo_servico = Column(String, nullable=False)

    funcionarios = relationship("Funcionario", back_populates="estabelecimento")
    servicos = relationship("Servico", back_populates="estabelecimento")
    agendamentos = relationship("Agendamento", back_populates="estabelecimento")
    configuracoes_agenda = relationship("ConfiguracaoAgenda", back_populates="estabelecimento")
