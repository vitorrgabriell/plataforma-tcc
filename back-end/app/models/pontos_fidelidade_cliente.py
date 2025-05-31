from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class PontosFidelidadeCliente(Base):
    __tablename__ = "pontos_fidelidade_cliente"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    estabelecimento_id = Column(
        Integer, ForeignKey("estabelecimentos.id"), nullable=False
    )
    pontos_acumulados = Column(Integer, default=0)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    estabelecimento = relationship("Estabelecimento", backref="pontos")
