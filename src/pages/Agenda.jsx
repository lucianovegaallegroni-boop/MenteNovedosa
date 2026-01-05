import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AgendaCalendar from '../components/AgendaCalendar'
import AppointmentCard from '../components/AppointmentCard'
import './Agenda.css'

// Sample appointments data - in a real app, this would come from a database
const SAMPLE_APPOINTMENTS = [
    {
        id: 1,
        date: '2026-01-04',
        name: 'María González',
        type: 'Terapia Individual',
        startTime: '09:00',
        endTime: '10:00',
        status: 'confirmed'
    },
    {
        id: 2,
        date: '2026-01-04',
        name: 'Carlos Ruiz',
        type: 'Primera Consulta',
        startTime: '11:30',
        endTime: '12:30',
        status: 'pending'
    },
    {
        id: 3,
        date: '2026-01-04',
        name: 'Ana Martínez',
        type: 'Terapia de Pareja',
        startTime: '15:00',
        endTime: '16:00',
        status: 'confirmed'
    },
    {
        id: 4,
        date: '2026-01-05',
        name: 'Pedro Sánchez',
        type: 'Orientación Vocacional',
        startTime: '10:00',
        endTime: '11:00',
        status: 'confirmed'
    },
    {
        id: 5,
        date: '2026-01-06',
        name: 'Laura Díaz',
        type: 'Terapia Individual',
        startTime: '09:30',
        endTime: '10:30',
        status: 'pending'
    }
]

const HOURS = [
    { hour: '08:00', period: 'AM' },
    { hour: '09:00', period: 'AM' },
    { hour: '10:00', period: 'AM' },
    { hour: '11:00', period: 'AM' },
    { hour: '12:00', period: 'PM' },
    { hour: '01:00', period: 'PM' },
    { hour: '02:00', period: 'PM' },
    { hour: '03:00', period: 'PM' },
    { hour: '04:00', period: 'PM' },
    { hour: '05:00', period: 'PM' },
]

function Agenda() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [currentTime, setCurrentTime] = useState(new Date())

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)
        return () => clearInterval(timer)
    }, [])

    // Get dates that have appointments
    const appointmentDates = [...new Set(SAMPLE_APPOINTMENTS.map(apt => apt.date))]

    // Get appointments for selected date
    const getDateString = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    const selectedDateStr = getDateString(selectedDate)
    const todayAppointments = SAMPLE_APPOINTMENTS.filter(apt => apt.date === selectedDateStr)

    // Format selected date
    const formatSelectedDate = () => {
        const today = new Date()
        const isToday = selectedDate.toDateString() === today.toDateString()

        const options = { weekday: 'long', day: 'numeric', month: 'long' }
        const dateStr = selectedDate.toLocaleDateString('es-MX', options)

        return isToday ? `Hoy, ${dateStr.split(',')[1]?.trim() || dateStr}` : dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
    }

    // Get appointment for a specific hour
    const getAppointmentForHour = (hourStr) => {
        const hourNum = parseInt(hourStr.split(':')[0])
        return todayAppointments.find(apt => {
            const aptHour = parseInt(apt.startTime.split(':')[0])
            return aptHour === hourNum || (hourNum >= 13 && aptHour === hourNum)
        })
    }

    // Calculate current time position
    const getCurrentTimePosition = () => {
        const hours = currentTime.getHours()
        const minutes = currentTime.getMinutes()

        // Only show if within working hours (8 AM - 6 PM)
        if (hours < 8 || hours >= 18) return null

        const totalMinutes = (hours - 8) * 60 + minutes
        const maxMinutes = 10 * 60 // 10 hours of timeline
        const percentage = (totalMinutes / maxMinutes) * 100

        return {
            top: `${percentage}%`,
            time: currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        }
    }

    const timePosition = getCurrentTimePosition()
    const isToday = selectedDate.toDateString() === new Date().toDateString()

    return (
        <div className="agenda-page">
            {/* Header */}
            <header className="agenda-header">
                <div className="agenda-header-left">
                    <span className="agenda-header-subtitle">Psicóloga Rut Ordoñez</span>
                    <h1 className="agenda-header-title">Agenda</h1>
                </div>
                <div className="agenda-header-actions">
                    <button className="agenda-search-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                    </button>
                    <Link to="/agendar" className="agenda-add-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="agenda-main">
                <Link to="/" className="agenda-back-link">
                    ← Volver al inicio
                </Link>

                {/* Calendar */}
                <AgendaCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    appointmentDates={appointmentDates}
                />

                {/* Day Summary */}
                <div className="day-summary-section">
                    <div className="day-summary-header">
                        <div className="day-summary-info">
                            <h2>{formatSelectedDate()}</h2>
                            <p>{todayAppointments.length} cita{todayAppointments.length !== 1 ? 's' : ''} programada{todayAppointments.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="active-status">
                            Activo
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="timeline-section">
                    {/* Current time indicator */}
                    {isToday && timePosition && (
                        <div
                            className="current-time-indicator"
                            style={{ top: timePosition.top }}
                        >
                            <div className="current-time-dot"></div>
                            <div className="current-time-line"></div>
                            <span className="current-time-badge">{timePosition.time}</span>
                        </div>
                    )}

                    {HOURS.map((timeSlot, index) => {
                        const hourNum = index + 8
                        const hourStr = `${String(hourNum).padStart(2, '0')}:00`
                        const appointment = todayAppointments.find(apt => {
                            const aptHour = parseInt(apt.startTime.split(':')[0])
                            return aptHour === hourNum
                        })

                        return (
                            <div key={hourStr} className="timeline-slot">
                                <div className="timeline-time-label">
                                    <span className="hour">{timeSlot.hour.split(':')[0]}:{timeSlot.hour.split(':')[1]}</span>
                                    <span className="period">{timeSlot.period}</span>
                                </div>
                                <div className={`timeline-content ${appointment ? 'has-appointment' : ''}`}>
                                    {appointment ? (
                                        <AppointmentCard appointment={appointment} />
                                    ) : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="agenda-bottom-nav">
                <Link to="/agenda" className="nav-item active">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Agenda</span>
                </Link>
                <button className="nav-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Pacientes</span>
                </button>
                <Link to="/agendar" className="nav-fab">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </Link>
                <button className="nav-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span>Avisos</span>
                </button>
                <button className="nav-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>Ajustes</span>
                </button>
            </nav>
        </div>
    )
}

export default Agenda
