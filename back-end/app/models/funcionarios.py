from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Funcionario(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    senha = Column(String, nullable=False)
    cargo = Column(String, nullable=False)
    estabelecimento_id = Column(Integer, ForeignKey("estabelecimentos.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    estabelecimento = relationship("Estabelecimento", back_populates="funcionarios")
    agendamentos_profissional = relationship(
        "Agendamento", back_populates="profissional"
    )
    agenda = relationship("AgendaDisponivel", back_populates="profissional")
    configuracoes_agenda = relationship(
        "ConfiguracaoAgenda", back_populates="profissional"
    )
