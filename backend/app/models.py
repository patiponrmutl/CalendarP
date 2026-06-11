# backend/app/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    all_day = Column(Boolean, default=True)
    color = Column(String(50), default="#10b981")
    priority = Column(Integer, default=3)  # เพิ่มบรรทัดนี้ (1: ด่วนที่สุด, 2: สำคัญ, 3: ทั่วไป)