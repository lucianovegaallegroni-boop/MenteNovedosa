import './TimeSlots.css'

const AVAILABLE_TIMES = [
    '10:00 AM',
    '11:30 AM',
    '03:00 PM',
    '04:30 PM',
    '06:00 PM'
]

function TimeSlots({ selectedTime, onTimeSelect }) {
    return (
        <div className="time-slots">
            <h3 className="time-slots-title">Horarios disponibles</h3>
            <div className="time-slots-grid">
                {AVAILABLE_TIMES.map(time => (
                    <button
                        key={time}
                        className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => onTimeSelect(time)}
                    >
                        {time}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default TimeSlots
