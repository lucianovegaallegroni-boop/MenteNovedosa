import { Link } from 'react-router-dom'
import './FloatingButton.css'

function FloatingButton() {
    return (
        <Link to="/agendar" className="floating-button">
            <span className="floating-icon">📅</span>
            <span className="floating-text">Agendar Cita</span>
        </Link>
    )
}

export default FloatingButton
