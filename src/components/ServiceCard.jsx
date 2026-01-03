import './ServiceCard.css'

function ServiceCard({ title, description, duration, image, delay = 0 }) {
    return (
        <article
            className="service-card animate-slide-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="service-image">
                <img src={image} alt={title} />
                {duration && (
                    <span className="service-duration">{duration}</span>
                )}
            </div>
            <div className="service-content">
                <h3 className="service-title">{title}</h3>
                <p className="service-description">{description}</p>
                {/* <button className="btn btn-secondary service-btn">
                    Saber más
                </button> */}
            </div>
        </article>
    )
}

export default ServiceCard
