from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Avaliacao(Base):
    __tablename__ = "avaliacoes"

    id = Column(Integer, primary_key=True, index=True)
    agendamento_id = Column(Integer, ForeignKey("agendamentos.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    profissional_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    estabelecimento_id = Column(
        Integer, ForeignKey("estabelecimentos.id"), nullable=False
    )
    nota = Column(Integer, nullable=False)
    comentario = Column(Text)
    criado_em = Column(DateTime, server_default=func.now())

    cliente = relationship("User")
    profissional = relationship("Funcionario")
    estabelecimento = relationship("Estabelecimento")
