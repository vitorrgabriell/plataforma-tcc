from sqlalchemy import Column, Integer, String, DateTime, func
from app.db.database import Base


class BlacklistToken(Base):
    __tablename__ = "blacklist_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=func.now())
