from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
import datetime

class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_nome = Column(String, nullable=False)
    data_hora = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    profissional_id = Column(Integer, ForeignKey("funcionarios.id"))

    profissional = relationship("Funcionario", back_populates="agendamentos")