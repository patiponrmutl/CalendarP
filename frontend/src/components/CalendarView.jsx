import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import thLocale from '@fullcalendar/core/locales/th';
import './CalendarStyle.css';

export default function CalendarView() {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  
  const [eventTitle, setEventTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // เปลี่ยนค่าเริ่มต้นเป็น Array ว่าง
  const [events, setEvents] = useState([]);

  // URL ของ Backend API
  const API_URL = "http://127.0.0.1:8000/api/events";

  // --- 1. ดึงข้อมูลจาก Backend เมื่อโหลดหน้าเว็บ ---
  const fetchEvents = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        // แปลงรูปแบบข้อมูลให้ตรงกับที่ FullCalendar ต้องการ
        const formattedEvents = data.map(ev => ({
          id: String(ev.id),
          title: ev.title,
          start: ev.start_time,
          end: ev.end_time,
          allDay: ev.all_day,
          backgroundColor: ev.color
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("เชื่อมต่อ Backend ไม่สำเร็จ:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- จัดการ Theme ---
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleDateClick = (arg) => {
    setSelectedDateStr(arg.dateStr);
    setIsModalOpen(true);
  };

  // --- 2. ลบนัดหมาย (ส่ง DELETE ไปที่ Backend) ---
  const handleEventClick = async (clickInfo) => {
    if (window.confirm(`คุณต้องการลบนัดหมาย '${clickInfo.event.title}' ใช่หรือไม่?`)) {
      try {
        const response = await fetch(`${API_URL}/${clickInfo.event.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // ถ้าลบในฐานข้อมูลสำเร็จ ให้ลบออกจากหน้าจอด้วย
          setEvents(events.filter(event => event.id !== clickInfo.event.id));
        }
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  // --- 3. เพิ่มนัดหมายใหม่ (ส่ง POST ไปที่ Backend) ---
  const handleAddEvent = async () => {
    if (!eventTitle) {
      alert('กรุณากรอกชื่อนัดหมายครับ');
      return;
    }

    const startDateTime = startTime ? `${selectedDateStr}T${startTime}:00` : `${selectedDateStr}T00:00:00`;
    const endDateTime = endTime ? `${selectedDateStr}T${endTime}:00` : null;
    const isAllDay = !startTime;

    // โครงสร้างข้อมูลที่ Backend ต้องการ
    const newEventPayload = {
      title: eventTitle,
      start_time: startDateTime,
      end_time: endDateTime,
      all_day: isAllDay,
      color: '#6366f1' // สีหลักของแอป
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEventPayload),
      });

      if (response.ok) {
        // ถ้าบันทึกสำเร็จ ให้ดึงข้อมูลใหม่ทั้งหมดมาแสดง (เพื่อเอา ID จริงจาก Database)
        fetchEvents();
        closeModal();
      } else {
        alert("ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEventTitle('');
    setStartTime('');
    setEndTime('');
  };

  return (
    <div>
      <header className="app-header">
        <h1 className="app-title">CalAI จัดปฏิทิน</h1>
        <button onClick={toggleTheme} className="btn btn-secondary">
          {theme === 'light' ? '🌙 โหมดมืด' : '☀️ โหมดสว่าง'}
        </button>
      </header>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locales={[thLocale]}
          locale="th"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          height="70vh"
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          dayMaxEvents={true}
        />
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>เพิ่มนัดหมายใหม่</h3>
              <p style={{ color: 'var(--text-sub)', margin: '0' }}>วันที่: {selectedDateStr}</p>
            </div>
            
            <div className="modal-body" style={{ marginTop: '15px' }}>
              <label>ชื่อนัดหมาย / กิจกรรม</label>
              <input 
                type="text" 
                className="modal-input" 
                placeholder="เช่น ประชุม, นัดส่งงาน..." 
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                autoFocus
              />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>เวลาเริ่ม (ตัวเลือก)</label>
                  <input 
                    type="time" 
                    className="modal-input" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>เวลาสิ้นสุด (ตัวเลือก)</label>
                  <input 
                    type="time" 
                    className="modal-input" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleAddEvent}>บันทึกนัดหมาย</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}