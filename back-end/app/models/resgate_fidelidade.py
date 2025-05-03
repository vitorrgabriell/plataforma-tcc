from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class ResgateFidelidade(Base):
    __tablename__ = "resgates_fidelidade"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    programa_fidelidade_id = Column(Integer, ForeignKey("programa_fidelidade.id"), nullable=False)
    data_resgate = Column(DateTime(timezone=True), server_default=func.now())
