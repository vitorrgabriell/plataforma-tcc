from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    stripe_customer_id = Column(String, nullable=True)
    default_payment_method_id = Column(String, nullable=True)

    usuario = relationship("User", back_populates="cliente")
