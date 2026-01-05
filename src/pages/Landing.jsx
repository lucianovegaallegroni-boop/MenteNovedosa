import Header from '../components/Header'
import FloatingButton from '../components/FloatingButton'
import ServiceCard from '../components/ServiceCard'
import TestimonialCard from '../components/TestimonialCard'
import rutProfileImage from '../assets/images/rut-profile.jpg'
import terapiaIndividualImage from '../assets/images/terapia-individual.jpg'
import orientacionImage from '../assets/images/talleres.jpg'
import talleresImage from '../assets/images/talleres-new.png'
import './Landing.css'

// Placeholder images - these would be replaced with actual images
const SERVICES = [
    {
        id: 1,
        title: 'Terapia Individual',
        description: 'Psicoterapia enfocada en tu proceso, bienestar y equilibrio emocional.',
        duration: '60 min',
        image: terapiaIndividualImage
    },
    {
        id: 2,
        title: 'Orientación vocacional y profesional',
        description: 'Acompañamiento a adolescentes y jóvenes en decisiones académicas y profesionales.',
        duration: '45 min',
        image: orientacionImage
    },
    {
        id: 3,
        title: 'Talleres psicoeducativos',
        description: 'Talleres para escuelas y empresas enfocados en bienestar emocional y desarrollo personal.',
        duration: '90-120 min',
        image: talleresImage
    }
]

const TESTIMONIALS = [
    {
        id: 1,
        text: 'Rut me ayudó a entender mis patrones de ansiedad. Me siento mucho más segura y tranquila ahora.',
        author: 'María G.'
    },
    {
        id: 2,
        text: 'La mejor decisión que tomé fue empezar terapia. Rut es muy profesional y empática.',
        author: 'Carlos R.'
    }
]

function Landing() {
    return (
        <div className="landing">
            <Header />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-container">
                    <span className="hero-badge">Psicóloga General</span>
                    <h1 className="hero-title">
                        Un lugar seguro para tu proceso <span className="gradient-text">emocional</span>
                    </h1>
                    <p className="hero-description">
                        Empatía, respeto y herramientas para tu bienestar.                    </p>
                    <div className="hero-buttons">
                        <a href="#servicios" className="btn btn-primary btn-lg">
                            Mis Servicios
                        </a>
                        <a
                            href="https://www.instagram.com/mentenovedosa?igsh=NXprbmp5MDdoN2R5"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-lg"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ marginRight: '8px' }}
                            >
                                <path
                                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                                    fill="currentColor"
                                />
                            </svg>
                            Sígueme en Instagram
                        </a>
                    </div>
                </div>
                <div className="hero-decoration">
                    <div className="decoration-circle decoration-circle-1"></div>
                    <div className="decoration-circle decoration-circle-2"></div>
                    <div className="decoration-circle decoration-circle-3"></div>
                </div>
            </section>

            {/* About Section */}
            <section id="sobre-mi" className="about section">
                <div className="container">
                    <div className="about-card">
                        <div className="about-image">
                            <img
                                src={rutProfileImage}
                                alt="Rut Ordoñez - Psicóloga"
                            />
                        </div>
                        <div className="about-content">
                            <span className="about-wave">👋</span>
                            <h2 className="about-title">Hola, soy Rut</h2>
                            <p className="about-subtitle">Licenciada en Psicología</p>
                            <p className="about-text">
                                Mi objetivo es proporcionarte un espacio seguro y confidencial donde puedas conocerte a
                                ti mismo/a, superar obstáculos, y obtener herramientas para una vida más plena.
                            </p>
                            <div className="about-badges">
                                <span className="badge badge-outline">Idoneidad #7999</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="servicios" className="services section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Mis Servicios</h2>
                        {/* <a href="#" className="section-link">Ver todos →</a> */}
                    </div>
                    <div className="services-grid">
                        {SERVICES.map((service, index) => (
                            <ServiceCard
                                key={service.id}
                                title={service.title}
                                description={service.description}
                                duration={service.duration}
                                image={service.image}
                                delay={index * 100}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonios" className="testimonials section">
                <div className="container">
                    <h2 className="section-title">Lo que dicen mis pacientes</h2>
                    <div className="testimonials-grid">
                        {TESTIMONIALS.map((testimonial, index) => (
                            <TestimonialCard
                                key={testimonial.id}
                                text={testimonial.text}
                                author={testimonial.author}
                                delay={index * 150}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Location Section */}
            <section id="ubicacion" className="location section">
                <div className="container">
                    <h2 className="section-title">Ubicación</h2>
                    <div className="location-card">
                        <div className="location-map">

                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.769367944278!2d-79.51263592498158!3d8.993357591066545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8faca900cc47e835%3A0xb3b26960922803ce!2sCl%C3%ADnica%20De%20La%20Familia!5e0!3m2!1ses-419!2spa!4v1767408316559!5m2!1ses-419!2spa"
                                width="100%"
                                height="200"
                                style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Rut Ordóñez - Psicoterapeuta"
                            ></iframe>
                        </div>
                        <div className="location-info">
                            <div className="location-item">
                                <span className="location-icon">📍</span>
                                <div>
                                    <p className="location-label">Dirección</p>
                                    <p className="location-text">Clínica de la Familia, Ciudad de Panamá, Panamá</p>
                                </div>
                            </div>
                            <div className="location-item">
                                <span className="location-icon">✉️</span>
                                <div>
                                    <p className="location-label">Correo</p>
                                    <p className="location-text">psicrutordonez@gmail.com</p>
                                </div>
                            </div>
                            <div className="location-item">
                                <span className="location-icon">📞</span>
                                <div>
                                    <p className="location-label">Teléfono</p>
                                    <p className="location-text">+507 6917-8489</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p className="footer-text">
                        © 2024 Rut Ordoñez - Psicóloga General. Todos los derechos reservados.
                    </p>
                </div>
            </footer>

            {/* <FloatingButton /> */}
        </div>
    )
}

export default Landing
