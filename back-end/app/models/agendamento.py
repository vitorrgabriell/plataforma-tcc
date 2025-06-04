from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    profissional_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    servico_id = Column(Integer, ForeignKey("servicos.id"), nullable=False)
    horario = Column(DateTime, nullable=False)
    status = Column(String(20), default="pendente")
    criado_em = Column(DateTime, default=datetime.utcnow)
    notificado_1_dia = Column(Boolean, default=False)
    notificado_1_hora = Column(Boolean, default=False)
    estabelecimento_id = Column(
        Integer, ForeignKey("estabelecimentos.id"), nullable=False
    )

    cliente = relationship("User", back_populates="agendamentos_cliente")
    profissional = relationship(
        "Funcionario", back_populates="agendamentos_profissional"
    )
    servico = relationship("Servico", back_populates="agendamentos")
    estabelecimento = relationship("Estabelecimento", back_populates="agendamentos")
