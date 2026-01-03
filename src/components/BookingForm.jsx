import './BookingForm.css'

function BookingForm({ formData, onFormChange, onSubmit }) {
    const handleChange = (e) => {
        const { name, value } = e.target
        onFormChange({ ...formData, [name]: value })
    }

    return (
        <form className="booking-form" onSubmit={onSubmit}>
            <h3 className="booking-form-title">Tus datos</h3>

            <div className="input-group">
                <label className="input-label">Nombre completo</label>
                <div className="input-icon">
                    <span className="icon">👤</span>
                    <input
                        type="text"
                        name="name"
                        className="input-field"
                        placeholder="Ej. Ana Pérez"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Correo electrónico</label>
                <div className="input-icon">
                    <span className="icon">✉️</span>
                    <input
                        type="email"
                        name="email"
                        className="input-field"
                        placeholder="nombre@correo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Teléfono</label>
                <div className="input-icon">
                    <span className="icon">📞</span>
                    <input
                        type="tel"
                        name="phone"
                        className="input-field"
                        placeholder="+52 55 1234 5678"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg submit-btn">
                Confirmar Cita
            </button>

            <p className="booking-note">
                Se enviará una confirmación a tu correo.
            </p>
        </form>
    )
}

export default BookingForm
