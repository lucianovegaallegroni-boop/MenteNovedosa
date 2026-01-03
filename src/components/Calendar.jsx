import { useState } from 'react'
import './Calendar.css'

const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function Calendar({ selectedDate, onDateSelect }) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const handleDateClick = (day) => {
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

    const isPast = (day) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const checkDate = new Date(year, month, day)
        return checkDate < today
    }

    const renderDays = () => {
        const days = []

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const past = isPast(day)
            days.push(
                <button
                    key={day}
                    className={`calendar-day ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${past ? 'past' : ''}`}
                    onClick={() => !past && handleDateClick(day)}
                    disabled={past}
                >
                    {day}
                </button>
            )
        }

        return days
    }

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button className="calendar-nav" onClick={prevMonth}>
                    ‹
                </button>
                <span className="calendar-title">
                    {MONTHS[month]} {year}
                </span>
                <button className="calendar-nav" onClick={nextMonth}>
                    ›
                </button>
            </div>

            <div className="calendar-weekdays">
                {DAYS.map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                ))}
            </div>

            <div className="calendar-days">
                {renderDays()}
            </div>
        </div>
    )
}

export default Calendar
