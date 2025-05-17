from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    senha = Column(String, nullable=False)
    tipo_usuario = Column(String, nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    pontos_acumulados = Column(Integer, default=0)

    agendamentos_cliente = relationship("Agendamento", back_populates="cliente")
    cliente = relationship("Cliente", back_populates="usuario", uselist=False)