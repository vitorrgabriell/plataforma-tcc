from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class AgendaDisponivel(Base):
    __tablename__ = "agenda_disponivel"

    id = Column(Integer, primary_key=True, index=True)
    profissional_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    estabelecimento_id = Column(Integer, ForeignKey("estabelecimento.id"), nullable=False)  # 👈 NOVO CAMPO AQUI
    data_hora = Column(DateTime, nullable=False)
    ocupado = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    profissional = relationship("Funcionario", back_populates="agenda")
    estabelecimento_id = Column(Integer, ForeignKey("estabelecimentos.id"), nullable=False)

