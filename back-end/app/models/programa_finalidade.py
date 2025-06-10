from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ProgramaFidelidade(Base):
    __tablename__ = "programa_fidelidade"

    id = Column(Integer, primary_key=True, index=True)
    estabelecimento_id = Column(Integer, ForeignKey("estabelecimentos.id"), nullable=False, index=True)
    descricao_premio = Column(String, nullable=False)
    pontos_necessarios = Column(Integer, nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    ativo = Column(Boolean, default=True)

    estabelecimento = relationship("Estabelecimento", backref="programas_fidelidade")
