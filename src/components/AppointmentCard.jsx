import './AppointmentCard.css'

const STATUS_CONFIG = {
    confirmed: {
        label: 'Confirmada',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
            </svg>
        )
    },
    pending: {
        label: 'Pendiente',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    },
    cancelled: {
        label: 'Cancelada',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
        )
    }
}

const AVATAR_COLORS = ['pink', 'green', 'orange', 'purple']

function AppointmentCard({ appointment }) {
    const { name, type, startTime, endTime, status } = appointment
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending

    // Get initials from name
    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    // Assign avatar color based on name hash
    const colorIndex = name.length % AVATAR_COLORS.length
    const avatarColor = AVATAR_COLORS[colorIndex]

    return (
        <div className={`appointment-card ${status}`}>
            <div className={`appointment-avatar ${avatarColor}`}>
                {initials}
            </div>

            <div className="appointment-info">
                <h4 className="appointment-name">{name}</h4>
                <p className="appointment-type">{type}</p>

                <div className="appointment-details">
                    <div className="appointment-time">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        <span>{startTime} - {endTime}</span>
                    </div>

                    <div className={`appointment-status ${status}`}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                    </div>
                </div>
            </div>

            <div className="appointment-actions">
                <button className="appointment-menu-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default AppointmentCard
