import './TestimonialCard.css'

function TestimonialCard({ text, author, delay = 0 }) {
    return (
        <article
            className="testimonial-card animate-fade-in"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">{text}</p>
            <div className="testimonial-author">
                <div className="author-avatar">
                    {author.charAt(0)}
                </div>
                <span className="author-name">{author}</span>
            </div>
            {/* <div className="testimonial-stars">
                {'⭐'.repeat(5)}
            </div> */}
        </article>
    )
}

export default TestimonialCard
