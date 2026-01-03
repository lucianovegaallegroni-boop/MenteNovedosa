import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoImage from '../assets/images/logo.png'
import './Header.css'

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <img src={logoImage} alt="Logo" className="logo-icon" />
                    <span className="logo-text">Rut Ordoñez</span>
                </Link>

                <button
                    className="menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>

                <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
                    <a href="#servicios" className="nav-link">Servicios</a>
                    <a href="#sobre-mi" className="nav-link">Sobre mí</a>
                    <a href="#testimonios" className="nav-link">Testimonios</a>
                    <a href="#ubicacion" className="nav-link">Ubicación</a>
                    <Link to="/agendar" className="btn btn-primary nav-cta">
                        Agendar Cita
                    </Link>
                </nav>
            </div>
        </header>
    )
}

export default Header
