import './TimeSlots.css'



function TimeSlots({ selectedTime, onTimeSelect, availableTimes = [] }) {
    if (availableTimes.length === 0) {
        return (
            <div className="time-slots">
                <h3 className="time-slots-title">Horarios disponibles</h3>
                <p className="no-time-slots">No hay horarios disponibles para esta fecha.</p>
            </div>
        )
    }

    return (
        <div className="time-slots">
            <h3 className="time-slots-title">Horarios disponibles</h3>
            <div className="time-slots-grid">
                {availableTimes.sort().map(time => (
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
