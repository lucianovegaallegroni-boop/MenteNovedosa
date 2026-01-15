import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Configure dotenv
dotenv.config();

// ESM compatibility - define __dirname early
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
// Verify env vars
let transporter = null;
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS is missing in .env file - Email functionality disabled');
} else {
    // console.log('✅ Email configuration loaded for user:', process.env.EMAIL_USER);
    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS.replace(/\s+/g, '') // Remove spaces just in case
        }
    });
}

// ============================================
// GOOGLE CALENDAR SERVICE
// ============================================
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, 'token.json');

class GoogleCalendarService {
    constructor() {
        this.oauth2Client = null;
        this.calendar = null;
        this.isAuthenticated = false;
    }

    // Inicializar OAuth2 client con variables de entorno
    async initialize() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI;

        if (!clientId || !clientSecret) {
            console.warn('⚠️ Google Calendar: Credenciales no configuradas en .env');
            return false;
        }

        this.oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri
        );

        // 1. Intentar usar Refresh Token de variable de entorno (Prioridad para Vercel)
        if (process.env.GOOGLE_REFRESH_TOKEN) {
            try {
                this.oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
                this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
                this.isAuthenticated = true;
                console.log('✅ Google Calendar: Autenticación exitosa con GOOGLE_REFRESH_TOKEN');
                return true;
            } catch (error) {
                console.error('❌ Error usando GOOGLE_REFRESH_TOKEN:', error);
            }
        }

        // 2. Intentar cargar token guardado localmente (Solo entorno local)
        try {
            const token = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf-8'));
            this.oauth2Client.setCredentials(token);
            this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            this.isAuthenticated = true;
            console.log('✅ Google Calendar: Autenticación exitosa con token local file');
            return true;
        } catch (err) {
            // Ignorar error si no existe el archivo
        }

        console.log('ℹ️ Google Calendar: Se requiere autenticación. Visita /api/google/auth');
        return false;
    }

    // Generar URL de autenticación
    getAuthUrl() {
        if (!this.oauth2Client) return null;
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent'
        });
    }

    // Procesar callback de autenticación
    async handleCallback(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        // Guardar token para futuras ejecuciones
        // En Vercel esto fallará silenciosamente o se ignorará, pero es útil en local
        try {
            await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
            console.log('✅ Token guardado en', TOKEN_PATH);
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el token en disco (normal en Vercel):', error.message);
        }

        // Log para que el usuario pueda copiar el refresh token
        if (tokens.refresh_token) {
            console.log('\n==================================================================');
            console.log('🔑 IMPORTANTE: GUARDA ESTE REFRESH TOKEN EN TUS VARIABLES DE ENTORNO DE VERCEL:');
            console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
            console.log('==================================================================\n');
        }

        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        this.isAuthenticated = true;
        return tokens;
    }

    // Crear evento
    async crearEvento(eventoData) {
        if (!this.isAuthenticated) {
            throw new Error('No autenticado con Google Calendar');
        }

        const zonaHoraria = eventoData.zonaHoraria || process.env.CALENDAR_TIMEZONE || 'America/Panama';

        const evento = {
            summary: eventoData.titulo,
            location: eventoData.ubicacion || '',
            description: eventoData.descripcion || '',
            start: {
                dateTime: eventoData.fechaInicio,
                timeZone: zonaHoraria,
            },
            end: {
                dateTime: eventoData.fechaFin,
                timeZone: zonaHoraria,
            },
            attendees: eventoData.asistentes || [],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 },
                ],
            },
        };

        // Agregar Google Meet si se solicita
        if (eventoData.conGoogleMeet) {
            evento.conferenceData = {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            };
        }

        const response = await this.calendar.events.insert({
            calendarId: 'primary',
            resource: evento,
            conferenceDataVersion: eventoData.conGoogleMeet ? 1 : 0,
            sendUpdates: 'all',
        });

        console.log('✅ Evento creado exitosamente!');
        return response.data;
    }

    // Listar próximos eventos
    async listarEventos(cantidad = 10, timeMin = null, timeMax = null) {
        if (!this.isAuthenticated) {
            throw new Error('No autenticado con Google Calendar');
        }

        const params = {
            calendarId: 'primary',
            timeMin: timeMin || new Date().toISOString(),
            maxResults: cantidad,
            singleEvents: true,
            orderBy: 'startTime',
        };

        if (timeMax) {
            params.timeMax = timeMax;
        }

        const response = await this.calendar.events.list(params);
        return response.data.items || [];
    }

    // Obtener eventos por rango de fechas (para el calendario)
    async getEventosPorMes(year, month) {
        if (!this.isAuthenticated) {
            throw new Error('No autenticado con Google Calendar');
        }

        const timeMin = new Date(year, month, 1).toISOString();
        const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

        const response = await this.calendar.events.list({
            calendarId: 'primary',
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100,
        });

        return response.data.items || [];
    }

    // Actualizar evento
    async actualizarEvento(eventoId, cambios) {
        if (!this.isAuthenticated) {
            throw new Error('No autenticado con Google Calendar');
        }

        const response = await this.calendar.events.patch({
            calendarId: 'primary',
            eventId: eventoId,
            resource: cambios,
            sendUpdates: 'all',
        });

        return response.data;
    }

    // Eliminar evento
    async eliminarEvento(eventoId) {
        if (!this.isAuthenticated) {
            throw new Error('No autenticado con Google Calendar');
        }

        await this.calendar.events.delete({
            calendarId: 'primary',
            eventId: eventoId,
            sendUpdates: 'all',
        });
    }
}

// Instancia global del servicio
const calendarService = new GoogleCalendarService();

// Inicializar servicio de Google Calendar (async)
calendarService.initialize().catch(console.error);

// ============================================
// GOOGLE CALENDAR API ROUTES
// ============================================

// Verificar estado de autenticación
app.get('/api/google/status', (req, res) => {
    res.json({
        authenticated: calendarService.isAuthenticated,
        configured: !!process.env.GOOGLE_CLIENT_ID
    });
});

// Iniciar flujo de autenticación OAuth
app.get('/api/google/auth', (req, res) => {
    const authUrl = calendarService.getAuthUrl();
    if (!authUrl) {
        return res.status(500).json({ error: 'Google Calendar no configurado' });
    }
    res.redirect(authUrl);
});

// Callback de OAuth
app.get('/api/google/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ error: 'Código de autorización faltante' });
    }

    try {
        await calendarService.handleCallback(code);
        res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>✅ ¡Autenticación exitosa!</h1>
                    <p>Google Calendar está ahora conectado.</p>
                    <p>Revisa la consola del servidor para ver el Refresh Token si lo necesitas en Vercel.</p>
                    <p>Puedes cerrar esta ventana.</p>
                    <script>
                        setTimeout(() => window.close(), 5000);
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error en callback de Google:', error);
        res.status(500).json({ error: error.message });
    }
});

// Listar eventos
app.get('/api/calendar/events', async (req, res) => {
    try {
        const { cantidad = 10, timeMin, timeMax } = req.query;
        const eventos = await calendarService.listarEventos(
            parseInt(cantidad),
            timeMin,
            timeMax
        );
        res.json(eventos);
    } catch (error) {
        // Si no está autenticado, devolver array vacío en lugar de error
        if (error.message.includes('No autenticado')) {
            return res.json([]);
        }
        console.error('Error al listar eventos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener eventos por mes (para el calendario)
app.get('/api/calendar/events/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const eventos = await calendarService.getEventosPorMes(
            parseInt(year),
            parseInt(month) - 1 // JavaScript meses son 0-indexed
        );
        res.json(eventos);
    } catch (error) {
        // Si no está autenticado, devolver array vacío en lugar de error
        if (error.message.includes('No autenticado')) {
            return res.json([]);
        }
        console.error('Error al obtener eventos del mes:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear evento
app.post('/api/calendar/events', async (req, res) => {
    try {
        const evento = await calendarService.crearEvento(req.body);
        res.status(201).json(evento);
    } catch (error) {
        console.error('Error al crear evento:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar evento
app.patch('/api/calendar/events/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const evento = await calendarService.actualizarEvento(eventId, req.body);
        res.json(evento);
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar evento
app.delete('/api/calendar/events/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        await calendarService.eliminarEvento(eventId);
        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// Serve static files from the React app
// ============================================
// In Vercel, static files are handled by Vercel configuration/Output, but we keep this for local production preview if needed
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, 'dist')));

    // The "catchall" handler
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

// API Routes
app.post('/api/send-email', async (req, res) => {
    // Verificar que el email está configurado
    if (!transporter) {
        return res.status(503).json({
            error: 'Email service not configured',
            details: 'EMAIL_USER and EMAIL_PASS are not set in .env'
        });
    }

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
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);

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


// Only listen if run directly (Local development)
const currentFile = fileURLToPath(import.meta.url).replace(/\\/g, '/');
const executedFile = (process.argv[1] || '').replace(/\\/g, '/');
if (currentFile === executedFile || executedFile.endsWith('server.js')) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
export default app;
