import { useState, useEffect, useCallback } from 'react'
import './AgendaCalendar.css'

const DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// URL base del API (cambiar en producción)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function AgendaCalendar({ selectedDate, onDateSelect, appointmentDates = [], onEventsLoaded }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(false)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    // Cargar eventos del mes actual desde el servidor
    const loadEventsForMonth = useCallback(async () => {
        setLoading(true)

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/calendar/events/${year}/${month + 1}`
            )

            if (response.ok) {
                const eventosData = await response.json()
                setEvents(eventosData)

                // Notificar al padre si existe el callback
                if (onEventsLoaded) {
                    onEventsLoaded(eventosData)
                }
            }
        } catch (err) {
            // Silenciar errores para los visitantes
            console.log('Calendario: Sin conexión a Google Calendar')
        } finally {
            setLoading(false)
        }
    }, [year, month, onEventsLoaded])

    // Cargar eventos cuando cambia el mes
    useEffect(() => {
        loadEventsForMonth()
    }, [loadEventsForMonth])

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const handleDateClick = (day, isOtherMonth = false) => {
        if (isOtherMonth) return
        const date = new Date(year, month, day)
        onDateSelect(date)
    }

    const isSelected = (day) => {
        if (!selectedDate) return false
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year
        )
    }

    const isToday = (day) => {
        const today = new Date()
        return (
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
        )
    }

    // Verificar si un día tiene citas (desde Google Calendar o prop)
    const hasAppointments = (day) => {
        // Verificar desde prop appointmentDates
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        if (appointmentDates.includes(dateStr)) return true

        // Verificar desde eventos de Google Calendar
        const dayStart = new Date(year, month, day)
        const dayEnd = new Date(year, month, day, 23, 59, 59)

        return events.some(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date)
            return eventStart >= dayStart && eventStart <= dayEnd
        })
    }

    // Obtener eventos para un día específico
    const getEventsForDay = (day) => {
        const dayStart = new Date(year, month, day)
        const dayEnd = new Date(year, month, day, 23, 59, 59)

        return events.filter(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date)
            return eventStart >= dayStart && eventStart <= dayEnd
        })
    }

    // Obtener horas ocupadas de un día (para mostrar disponibilidad)
    const getOccupiedHours = (day) => {
        const dayEvents = getEventsForDay(day)
        return dayEvents.map(event => {
            const start = new Date(event.start.dateTime)
            const end = new Date(event.end.dateTime)
            return {
                start: start.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' }),
                end: end.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' })
            }
        })
    }

    const renderDays = () => {
        const days = []

        // Days from previous month
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i
            days.push(
                <div key={`prev-${day}`} className="agenda-day other-month">
                    {day}
                </div>
            )
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDay(day)
            const hasEvents = hasAppointments(day)

            days.push(
                <button
                    key={day}
                    className={`agenda-day ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${hasEvents ? 'has-appointments' : ''}`}
                    onClick={() => handleDateClick(day)}
                    title={hasEvents ? `${dayEvents.length} cita(s) programada(s)` : 'Disponible'}
                >
                    {day}
                    {hasEvents && (
                        <span className="event-indicator">{dayEvents.length}</span>
                    )}
                </button>
            )
        }

        // Days from next month to complete the grid
        const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7
        const remainingCells = totalCells - (firstDayOfMonth + daysInMonth)
        for (let day = 1; day <= remainingCells; day++) {
            days.push(
                <div key={`next-${day}`} className="agenda-day other-month">
                    {day}
                </div>
            )
        }

        return days
    }

    return (
        <div className="agenda-calendar">
            <div className="agenda-calendar-header">
                <button className="agenda-calendar-nav" onClick={prevMonth}>
                    ‹
                </button>
                <span className="agenda-calendar-title">
                    {MONTHS[month]} {year}
                    {loading && <span className="loading-spinner"> ⏳</span>}
                </span>
                <button className="agenda-calendar-nav" onClick={nextMonth}>
                    ›
                </button>
            </div>

            <div className="agenda-weekdays">
                {DAYS.map((day, index) => (
                    <div
                        key={`${day}-${index}`}
                        className={`agenda-weekday ${index === 0 || index === 6 ? 'weekend' : ''}`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="agenda-days">
                {renderDays()}
            </div>

            {/* Mostrar horas ocupadas del día seleccionado */}
            {selectedDate && (
                <div className="selected-day-events">
                    <h4>
                        {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
                    </h4>
                    {(() => {
                        const occupiedHours = getOccupiedHours(selectedDate.getDate())
                        if (occupiedHours.length > 0) {
                            return (
                                <>
                                    <p className="availability-note">Horas ocupadas:</p>
                                    <ul className="events-list">
                                        {occupiedHours.map((slot, index) => (
                                            <li key={index} className="event-item occupied">
                                                <span className="event-time">
                                                    {slot.start} - {slot.end}
                                                </span>
                                                <span className="event-title">Ocupado</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )
                        } else {
                            return <p className="available-message">✓ Horario disponible</p>
                        }
                    })()}
                </div>
            )}
        </div>
    )
}

export default AgendaCalendar


