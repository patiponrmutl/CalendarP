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
  
  // State สำหรับฟอร์ม
  const [eventTitle, setEventTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [events, setEvents] = useState([
    { id: '1', title: 'ประชุมโปรเจกต์', start: '2026-06-11T09:00:00', end: '2026-06-11T12:00:00', allDay: false, backgroundColor: '#6366f1' },
  ]);

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

  // เปิด Modal เมื่อคลิกวันที่
  const handleDateClick = (arg) => {
    setSelectedDateStr(arg.dateStr);
    setIsModalOpen(true);
  };

  // ลบนัดหมายเมื่อคลิกที่กิจกรรม
  const handleEventClick = (clickInfo) => {
    if (window.confirm(`คุณต้องการลบนัดหมาย '${clickInfo.event.title}' ใช่หรือไม่?`)) {
      setEvents(events.filter(event => event.id !== clickInfo.event.id));
    }
  };

  // บันทึกนัดหมาย
  const handleAddEvent = () => {
    if (!eventTitle) {
      alert('กรุณากรอกชื่อนัดหมายครับ');
      return;
    }

    // รวมวันที่และเวลาเข้าด้วยกัน (ถ้าไม่ได้เลือกเวลา จะถือว่าเป็นกิจกรรมทั้งวัน)
    const startDateTime = startTime ? `${selectedDateStr}T${startTime}:00` : selectedDateStr;
    const endDateTime = endTime ? `${selectedDateStr}T${endTime}:00` : undefined;

    const newEvent = {
      id: String(Date.now()),
      title: eventTitle,
      start: startDateTime,
      end: endDateTime,
      allDay: !startTime, // ถ้าไม่มีเวลาเริ่ม = allDay
      backgroundColor: '#10b981'
    };

    setEvents([...events, newEvent]);
    closeModal();
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
          eventClick={handleEventClick} // ฟังก์ชันคลิกเพื่อลบ
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
              
              {/* ช่องกรอกเวลา */}
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