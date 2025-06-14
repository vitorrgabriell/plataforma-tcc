from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class ConfiguracaoAgenda(Base):
    __tablename__ = "configuracoes_agenda"

    id = Column(Integer, primary_key=True)
    profissional_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    dia_semana = Column(String, nullable=False)
    hora_inicio = Column(String, nullable=False)
    hora_fim = Column(String, nullable=False)
    duracao_slot = Column(Integer, default=30)
    estabelecimento_id = Column(
        Integer, ForeignKey("estabelecimentos.id"), nullable=False
    )

    profissional = relationship("Funcionario", back_populates="configuracoes_agenda")
    estabelecimento = relationship(
        "Estabelecimento", back_populates="configuracoes_agenda"
    )
