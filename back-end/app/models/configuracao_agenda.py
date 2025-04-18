from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class ConfiguracaoAgenda(Base):
    __tablename__ = "configuracoes_agenda"

    id = Column(Integer, primary_key=True)
    profissional_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    dia_semana = Column(String, nullable=False)  # ex: 'segunda', 'terca'
    hora_inicio = Column(String, nullable=False)  # ex: '08:00'
    hora_fim = Column(String, nullable=False)     # ex: '17:00'
    duracao_slot = Column(Integer, default=30)

    profissional = relationship("Funcionario", back_populates="configuracoes_agenda")
