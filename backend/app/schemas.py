# backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventBase(BaseModel):
    title: str
    start_time: datetime
    end_time: Optional[datetime] = None
    all_day: bool = True
    color: str = "#10b981"
    priority: int = 3  # เพิ่มบรรทัดนี้ กำหนดค่าเริ่มต้นเป็น 3 (ทั่วไป)

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int

    class Config:
        from_attributes = True