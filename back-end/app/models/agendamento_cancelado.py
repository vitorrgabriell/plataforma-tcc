from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class AgendamentoCancelado(Base):
    __tablename__ = "agendamentos_cancelados"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    profissional_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    servico_id = Column(Integer, ForeignKey("servicos.id"), nullable=False)
    horario = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)
    criado_em = Column(DateTime, nullable=False)
    cancelado_em = Column(DateTime, default=datetime.utcnow)
    cancelado_por = Column(String, nullable=False)

    cliente = relationship("User", backref="cancelamentos_cliente")
    profissional = relationship("Funcionario", backref="cancelamentos_profissional")
    servico = relationship("Servico", backref="cancelamentos_servico")
