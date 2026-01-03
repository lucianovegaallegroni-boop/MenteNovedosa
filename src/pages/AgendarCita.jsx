import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Calendar from '../components/Calendar'
import TimeSlots from '../components/TimeSlots'
import BookingForm from '../components/BookingForm'
import './AgendarCita.css'

function AgendarCita() {
    const navigate = useNavigate()
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedDate || !selectedTime) {
            alert('Por favor selecciona una fecha y horario')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('http://localhost:3001/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    date: selectedDate.toLocaleDateString('es-MX', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    time: selectedTime
                }),
            })

            if (response.ok) {
                setIsSubmitting(false)
                setShowSuccess(true)

                // Reset form after success
                setTimeout(() => {
                    navigate('/')
                }, 3000)
            } else {
                throw new Error('Failed to send email')
            }
        } catch (error) {
            console.error('Error:', error)
            setIsSubmitting(false)
            alert('Hubo un error al agendar la cita. Por favor intenta nuevamente.')
        }
    }

    const formatDate = (date) => {
        if (!date) return ''
        return date.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (showSuccess) {
        return (
            <div className="agendar-page">
                <div className="success-container">
                    <div className="success-icon">✅</div>
                    <h2 className="success-title">¡Cita agendada!</h2>
                    <p className="success-message">
                        Te hemos enviado un correo de confirmación a <strong>{formData.email}</strong>
                    </p>
                    <div className="success-details">
                        <p><strong>Fecha:</strong> {formatDate(selectedDate)}</p>
                        <p><strong>Hora:</strong> {selectedTime}</p>
                    </div>
                    <p className="success-redirect">Redirigiendo al inicio...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="agendar-page">
            <header className="agendar-header">
                <Link to="/" className="back-button">
                    ←
                </Link>
                <h1 className="agendar-title">Agendar Cita</h1>
                <div className="header-spacer"></div>
            </header>

            <main className="agendar-content">
                <section className="date-section">
                    <h2 className="section-subtitle">Selecciona una fecha</h2>
                    <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                    />
                </section>

                {selectedDate && (
                    <TimeSlots
                        selectedTime={selectedTime}
                        onTimeSelect={setSelectedTime}
                    />
                )}

                {selectedDate && selectedTime && (
                    <BookingForm
                        formData={formData}
                        onFormChange={setFormData}
                        onSubmit={handleSubmit}
                    />
                )}

                {isSubmitting && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Agendando tu cita...</p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default AgendarCita
