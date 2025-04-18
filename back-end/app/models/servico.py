from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class Servico(Base):
    __tablename__ = "servicos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String, nullable=True)
    preco = Column(Float, nullable=False)
    tempo = Column(Integer, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    estabelecimento_id = Column(Integer, ForeignKey("estabelecimentos.id"), nullable=False)

    estabelecimento = relationship("Estabelecimento", back_populates="servicos")
    agendamentos = relationship("Agendamento", back_populates="servico")
