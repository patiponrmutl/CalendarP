# backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# โครงสร้างพื้นฐานของ Event
class EventBase(BaseModel):
    title: str
    start_time: datetime
    end_time: Optional[datetime] = None
    all_day: bool = True
    color: str = "#10b981"

# โครงสร้างตอนรับข้อมูลเพื่อสร้างใหม่
class EventCreate(EventBase):
    pass

# โครงสร้างตอนส่งข้อมูลกลับไปให้ Frontend
class EventResponse(EventBase):
    id: int

    class Config:
        from_attributes = True
        