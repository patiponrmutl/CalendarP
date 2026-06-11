# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database import engine, get_db
import app.models as models
import app.schemas as schemas

# สร้างตารางใน Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Calendar API")

# ตั้งค่า CORS อนุญาตให้ Frontend (Vite พอร์ต 5173) เรียกใช้งาน API ได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routes ---

# 1. ดึงข้อมูลนัดหมายทั้งหมด (GET)
@app.get("/api/events", response_model=List[schemas.EventResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(models.Event).all()
    return events

# 2. สร้างนัดหมายใหม่ (POST)
@app.post("/api/events", response_model=schemas.EventResponse)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

# 3. ลบนัดหมาย (DELETE)
@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="ไม่พบนัดหมายนี้ในระบบ")
    db.delete(db_event)
    db.commit()
    return {"message": "ลบนัดหมายสำเร็จ"}