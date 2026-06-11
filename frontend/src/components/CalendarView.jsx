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
  const [modalMode, setModalMode] = useState('create'); // 'create' หรือ 'view'
  
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState(3); // 1: ด่วนที่สุด, 2: สำคัญ, 3: ทั่วไป
  
  const [selectedEvent, setSelectedEvent] = useState(null); // เก็บงานที่เลือกดูรายละเอียด
  const [events, setEvents] = useState([]);

  const API_URL = "http://localhost:8000/api/events";

  const fetchEvents = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map(ev => ({
          id: String(ev.id),
          title: `${ev.priority === 1 ? '🔴 ' : ev.priority === 2 ? '🟡 ' : '🟢 '}${ev.title}`, // ใส่สัญลักษณ์สีตามความสำคัญ
          start: ev.start_time,
          end: ev.end_time,
          allDay: ev.all_day,
          backgroundColor: ev.priority === 1 ? '#ef4444' : ev.priority === 2 ? '#f59e0b' : '#10b981', // แดง / ส้ม / เขียว
          priority: ev.priority, // เก็บค่าไปใช้จัดลำดับ
          rawTitle: ev.title
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("เชื่อมต่อระบบไม่สำเร็จ:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // เมื่อคลิกช่องวันที่ว่างเปล่า -> เปิดโหมดสร้างงานใหม่
  const handleDateClick = (arg) => {
    setSelectedDateStr(arg.dateStr);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // เมื่อคลิกที่ตัวงาน -> เปิดโหมดดูข้อมูลเพิ่มเติม
  const handleEventClick = (clickInfo) => {
    const clickedId = clickInfo.event.id;
    // ค้นหางานตัวเต็มใน State เพื่อเอาข้อมูลมาแสดงใน Pop-up
    const fullEvent = events.find(e => e.id === clickedId);
    if (fullEvent) {
      setSelectedEvent(fullEvent);
      setModalMode('view');
      setIsModalOpen(true);
    }
  };

  const handleAddEvent = async () => {
    if (!eventTitle) {
      alert('กรุณากรอกชื่อนัดหมายครับ');
      return;
    }

    const startDateTime = startTime ? `${selectedDateStr}T${startTime}:00` : `${selectedDateStr}T00:00:00`;
    const endDateTime = endTime ? `${selectedDateStr}T${endTime}:00` : null;

    const newEventPayload = {
      title: eventTitle,
      start_time: startDateTime,
      end_time: endDateTime,
      all_day: !startTime,
      priority: parseInt(priority, 10)
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventPayload),
      });

      if (response.ok) {
        fetchEvents();
        closeModal();
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (window.confirm(`คุณต้องการลบนัดหมายนี้ใช่หรือไม่?`)) {
      try {
        const response = await fetch(`${API_URL}/${selectedEvent.id}`, { method: 'DELETE' });
        if (response.ok) {
          setEvents(events.filter(event => event.id !== selectedEvent.id));
          closeModal();
        }
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEventTitle('');
    setStartTime('');
    setEndTime('');
    setPriority(3);
    setSelectedEvent(null);
  };

  return (
    <div>
      <header className="app-header">
        <h1 className="app-title">CalAI จัดปฏิทิน</h1>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="btn btn-secondary">
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
            right: 'dayGridMonth,timeGridWeek'
          }}
          events={events}
          height="70vh"
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          dayMaxEvents={true}
          
          // ตัวกำหนดการเรียงลำดับ: เรียงตาม priority (เลข 1 จะอยู่บนสุด)
          eventOrder="priority" 
        />
      </div>

      {/* Pop-upอเนกประสงค์ */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* โหมดที่ 1: โหมดสร้างงานใหม่ */}
            {modalMode === 'create' ? (
              <>
                <div className="modal-header">
                  <h3>เพิ่มนัดหมายใหม่</h3>
                  <p style={{ color: 'var(--text-sub)', margin: '0' }}>วันที่: {selectedDateStr}</p>
                </div>
                <div className="modal-body" style={{ marginTop: '15px' }}>
                  <label>ชื่อนัดหมาย / กิจกรรม</label>
                  <input type="text" className="modal-input" placeholder="เช่น ประชุม, นัดส่งงาน..." value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} autoFocus />
                  
                  <label>ระดับความสำคัญ</label>
                  <select className="modal-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value={1}>🔴 ด่วนที่สุด (แสดงบนสุด)</option>
                    <option value={2}>🟡 สำคัญ</option>
                    <option value={3}>🟢 ทั่วไป</option>
                  </select>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label>เวลาเริ่ม</label>
                      <input type="time" className="modal-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>เวลาสิ้นสุด</label>
                      <input type="time" className="modal-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>ยกเลิก</button>
                  <button className="btn btn-primary" onClick={handleAddEvent}>บันทึกนัดหมาย</button>
                </div>
              </>
            ) : (
              // โหมดที่ 2: โหมดดูข้อมูลเพิ่มเติมและจัดการงาน
              <>
                <div className="modal-header">
                  <h3>รายละเอียดกิจกรรม</h3>
                  <span className="badge" style={{
                    backgroundColor: selectedEvent?.priority === 1 ? '#ef4444' : selectedEvent?.priority === 2 ? '#f59e0b' : '#10b981',
                    color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                  }}>
                    {selectedEvent?.priority === 1 ? 'ด่วนที่สุด' : selectedEvent?.priority === 2 ? 'สำคัญ' : 'ทั่วไป'}
                  </span>
                </div>
                <div className="modal-body" style={{ marginTop: '20px', color: 'var(--text-main)' }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>{selectedEvent?.rawTitle}</h2>
                  <p>📅 <strong>วันที่:</strong> {selectedEvent?.start.split('T')[0]}</p>
                  {selectedEvent?.start.includes('T') && (
                    <p>⏰ <strong>เวลาเริ่ม:</strong> {selectedEvent?.start.split('T')[1].substring(0, 5)} น.</p>
                  )}
                  {selectedEvent?.end && (
                    <p>🏁 <strong>เวลาสิ้นสุด:</strong> {selectedEvent?.end.split('T')[1].substring(0, 5)} น.</p>
                  )}
                </div>
                <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn" style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none' }} onClick={handleDeleteEvent}>🗑️ ลบกิจกรรม</button>
                  <button className="btn btn-secondary" onClick={closeModal}>ปิดหน้าต่าง</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}