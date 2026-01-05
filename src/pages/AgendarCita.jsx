import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Calendar from '../components/Calendar'
import TimeSlots from '../components/TimeSlots'
import BookingForm from '../components/BookingForm'
import './AgendarCita.css'
import emailjs from '@emailjs/browser'

// URL base del API (cambiar en producción)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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

    // Estados para manejo de horarios
    const [availableSlots, setAvailableSlots] = useState([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)

    // Horarios base de atención (puedes personalizar esto)
    const BASE_SLOTS = [
        '09:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '01:00 PM', '02:00 PM',
        '03:00 PM', '04:00 PM', '05:00 PM'
    ]

    // Efecto para cargar disponibilidad cuando cambia la fecha
    useEffect(() => {
        if (selectedDate) {
            checkAvailability(selectedDate)
        } else {
            setAvailableSlots([])
        }
        setSelectedTime(null) // Resetear hora seleccionada al cambiar fecha
    }, [selectedDate])

    const checkAvailability = async (date) => {
        setIsLoadingSlots(true)
        try {
            // Definir rango del día seleccionado (00:00 a 23:59)
            const startOfDay = new Date(date)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(date)
            endOfDay.setHours(23, 59, 59, 999)

            // Consultar eventos del día al backend
            const response = await fetch(`${API_BASE_URL}/api/calendar/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&cantidad=50`)

            if (response.ok) {
                const events = await response.json()

                // Filtrar horarios ocupados
                const busyTimes = events.map(event => {
                    const eventDate = new Date(event.start.dateTime || event.start.date)
                    return eventDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                })

                // Calcular slots disponibles
                const available = BASE_SLOTS.filter(slot => {
                    // Convertir el slot a un objeto Date para comparar rangos
                    const [time, period] = slot.split(' ')
                    let [hours, minutes] = time.split(':')
                    hours = parseInt(hours)
                    if (period === 'PM' && hours !== 12) hours += 12
                    else if (period === 'AM' && hours === 12) hours = 0

                    // Asumir que la cita del slot dura 1 hora
                    const slotStart = new Date(startOfDay)
                    slotStart.setHours(hours, parseInt(minutes), 0)
                    const slotEnd = new Date(slotStart)
                    slotEnd.setHours(slotStart.getHours() + 1)

                    return !events.some(event => {
                        const eventStart = new Date(event.start.dateTime || event.start.date)
                        const eventEnd = new Date(event.end.dateTime || event.end.date)

                        // Verificar superposición de intervalos (Overlap)
                        // (StartA < EndB) && (EndA > StartB)
                        return (slotStart < eventEnd && slotEnd > eventStart)
                    })
                })

                setAvailableSlots(available)
            } else {
                console.error('Error al obtener disponibilidade')
                setAvailableSlots(BASE_SLOTS) // Fallback: mostrar todos si falla
            }
        } catch (error) {
            console.error('Error de conexión:', error)
            setAvailableSlots(BASE_SLOTS)
        } finally {
            setIsLoadingSlots(false)
        }
    }

    // Función para crear evento en Google Calendar
    const createCalendarEvent = async () => {
        try {
            // Construir fecha/hora en formato ISO
            const startDateTime = new Date(selectedDate)

            // Parsear la hora seleccionada (formato: "9:00 AM" o "14:00")
            const timeParts = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)?/i)
            if (timeParts) {
                let hours = parseInt(timeParts[1])
                const minutes = parseInt(timeParts[2])
                const period = timeParts[3]

                // Convertir a formato 24h si es necesario
                if (period) {
                    if (period.toUpperCase() === 'PM' && hours !== 12) {
                        hours += 12
                    } else if (period.toUpperCase() === 'AM' && hours === 12) {
                        hours = 0
                    }
                }

                startDateTime.setHours(hours, minutes, 0, 0)
            }

            // Fin de la cita: 1 hora después
            const endDateTime = new Date(startDateTime)
            endDateTime.setHours(endDateTime.getHours() + 1)

            const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo: `Cita - ${formData.name}`,
                    descripcion: `Cliente: ${formData.name}\nEmail: ${formData.email}\nTeléfono: ${formData.phone}`,
                    fechaInicio: startDateTime.toISOString(),
                    fechaFin: endDateTime.toISOString(),
                    asistentes: [{ email: formData.email }],
                    conGoogleMeet: true
                })
            })

            if (response.ok) {
                const evento = await response.json()
                console.log('✅ Evento creado en Google Calendar:', evento.htmlLink)
                return evento
            } else {
                console.log('⚠️ No se pudo crear evento en Google Calendar (servidor no configurado)')
            }
        } catch (error) {
            // Si falla Google Calendar, no bloquear el flujo principal
            console.log('⚠️ Google Calendar no disponible:', error.message)
        }
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedDate || !selectedTime) {
            alert('Por favor selecciona una fecha y horario')
            return
        }

        setIsSubmitting(true)

        try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            console.log('Sending email with:', { serviceId, templateId, publicKey });

            const templateParams = {
                'username': formData.name,
                'email': formData.email,
                'phone': formData.phone,
                'date': selectedDate.toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                'time': selectedTime
            };

            await emailjs.send(serviceId, templateId, templateParams, publicKey);

            // Crear evento en Google Calendar (no bloquea si falla)
            await createCalendarEvent()

            setIsSubmitting(false)
            setShowSuccess(true)

            // Reset form after success
            setTimeout(() => {
                navigate('/')
            }, 3000)

        } catch (error) {
            console.error('Error:', error)
            setIsSubmitting(false)
            alert('Hubo un error al agendar la cita. Por favor intenta nuevamente. ' + (error.text || error.message))
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
                    <div className="time-slots-container">
                        {isLoadingSlots ? (
                            <div className="slots-loading">
                                <div className="loading-spinner small"></div>
                                <p>Verificando disponibilidad...</p>
                            </div>
                        ) : (
                            <TimeSlots
                                selectedTime={selectedTime}
                                onTimeSelect={setSelectedTime}
                                availableTimes={availableSlots}
                            />
                        )}
                    </div>
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
