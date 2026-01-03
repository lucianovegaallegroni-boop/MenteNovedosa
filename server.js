import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configure dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.post('/api/send-email', async (req, res) => {
    const { name, email, phone, date, time } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // Send confirmation to the user
        subject: 'Confirmación de Cita - Mente Novedosa',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">¡Cita Confirmada!</h2>
                <p>Hola ${name},</p>
                <p>Tu cita ha sido agendada exitosamente.</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Detalles de la cita:</h3>
                    <p><strong>Fecha:</strong> ${date}</p>
                    <p><strong>Hora:</strong> ${time}</p>
                    <p><strong>Teléfono registrado:</strong> ${phone}</p>
                </div>
                
                <p>Si necesitas reagendar o cancelar, por favor contáctanos con anticipación.</p>
                
                <p>Saludos,<br>Equipo Mente Novedosa</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);

        // Optional: Send notification to admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send copy to admin/self
            subject: `Nueva Cita Agendada: ${name}`,
            html: `
                <h3>Nueva cita agendada</h3>
                <p><strong>Cliente:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${phone}</p>
                <p><strong>Fecha:</strong> ${date}</p>
                <p><strong>Hora:</strong> ${time}</p>
            `
        };
        await transporter.sendMail(adminMailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            error: 'Failed to send email',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
