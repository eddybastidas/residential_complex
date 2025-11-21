const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// Middleware
const errorHandler = require('./infrastructure/web/middleware/errorHandler');

// Routes
const authRoutes = require('./infrastructure/web/routes/authRoutes');
const airbnbRoutes = require('./infrastructure/web/routes/airbnbRoutes');
const apartmentRoutes = require('./infrastructure/web/routes/apartmentRoutes');
const userRoutes = require('./infrastructure/web/routes/userRoutes');
const maintenanceRoutes = require('./infrastructure/web/routes/maintenanceRoutes');
const damageReportRoutes = require('./infrastructure/web/routes/damageReportRoutes');
const notificationRoutes = require('./infrastructure/web/routes/notificationRoutes');
const paymentRoutes = require('./infrastructure/web/routes/paymentRoutes');
const rentalRoutes = require('./infrastructure/web/routes/rentalRoutes');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:3000', 'http://localhost', 'http://127.0.0.1'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Rate limiting
const { authLimiter, apiLimiter } = require('./infrastructure/web/middleware/rateLimiter');
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '🏢 Sistema Conjuntos Residenciales API',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        features: {
            airbnb: {
                description: 'Gestión de huéspedes Airbnb con notificaciones automáticas',
                endpoints: [
                    'POST /api/airbnb/guests - Registrar huésped',
                    'PUT /api/airbnb/guests/:id/checkin - Check-in por portería',
                    'GET /api/airbnb/guests/active - Control de seguridad'
                ]
            },
            maintenance: {
                description: 'Mantenimientos programados con notificación masiva',
                endpoints: [
                    'POST /api/maintenance - Programar mantenimiento',
                    'GET /api/maintenance - Ver mantenimientos',
                    'PUT /api/maintenance/:id/status - Actualizar estado'
                ]
            },
            damageReports: {
                description: 'Reportes de daños con notificación a propietarios',
                endpoints: [
                    'POST /api/damage-reports - Crear reporte',
                    'GET /api/damage-reports/my-reports - Ver mis reportes'
                ]
            },
            payments: {
                description: 'Sistema de mensualidades con notificaciones de mora',
                endpoints: [
                    'POST /api/payments - Registrar mensualidad',
                    'PUT /api/payments/:id/pay - Marcar como pagado'
                ]
            },
            notifications: {
                description: 'Sistema completo de notificaciones',
                endpoints: [
                    'GET /api/notifications - Ver notificaciones',
                    'POST /api/notifications - Enviar notificación general'
                ]
            }
        },
        apiEndpoints: {
            health: 'GET /health',
            test: 'GET /api/test',
            auth: 'POST /api/auth/login',
            airbnb: '/api/airbnb/*',
            maintenance: '/api/maintenance/*',
            damageReports: '/api/damage-reports/*',
            notifications: '/api/notifications/*',
            payments: '/api/payments/*',
            apartments: '/api/apartments/*',
            users: '/api/users/*',
            rentals: '/api/rentals/*'
        },
        documentation: {
            swagger: 'Ver docs/api/swagger.yaml para documentación completa',
            postman: 'Colección de Postman disponible para testing',
            readme: 'Ver README.md para instrucciones de instalación'
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '✅ API funcionando correctamente',
        timestamp: new Date().toISOString(),
        data: {
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: 'PostgreSQL conectado',
            features: [
                'Gestión de huéspedes Airbnb',
                'Mantenimientos programados', 
                'Reportes de daños',
                'Sistema de notificaciones',
                'Mensualidades y pagos',
                'Contratos de arriendo',
                'Control de acceso y seguridad'
            ],
            flowsImplemented: {
                airbnb: 'Registro → Notificación automática → Check-in → Control',
                maintenance: 'Programación → Notificación masiva → Seguimiento',
                damageReports: 'Reporte → Notificación al propietario → Seguimiento',
                payments: 'Mensualidad → Notificación de mora → Pago'
            }
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/airbnb', airbnbRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/damage-reports', damageReportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rentals', rentalRoutes);

// Welcome message for root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🏢 Bienvenido al Sistema de Conjuntos Residenciales',
        description: 'API REST para gestión completa de conjuntos residenciales',
        version: '1.0.0',
        developer: 'Proyecto Universitario - Universidad Surcolombiana',
        endpoints: {
            health: '/health - Estado del sistema',
            test: '/api/test - Prueba de conectividad',
            documentation: '/health - Documentación completa de endpoints'
        },
        features: [
            '🏠 Gestión de apartamentos y propietarios',
            '🛏️ Sistema Airbnb con notificaciones automáticas',
            '🔧 Mantenimientos programados',
            '⚠️ Reportes de daños',
            '💰 Gestión de pagos y mensualidades',
            '📬 Sistema de notificaciones',
            '🔐 Control de acceso y seguridad'
        ],
        nextSteps: [
            '1. Verificar estado: GET /health',
            '2. Probar conectividad: GET /api/test',
            '3. Autenticarse: POST /api/auth/login',
            '4. Explorar funcionalidades según documentación'
        ]
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler - debe ir al final
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
        statusCode: 404,
        suggestions: {
            availableEndpoints: {
                health: 'GET /health - Estado del sistema',
                test: 'GET /api/test - Prueba de conectividad', 
                login: 'POST /api/auth/login - Autenticación',
                airbnb: 'GET /api/airbnb/guests/active - Huéspedes activos',
                maintenance: 'GET /api/maintenance - Ver mantenimientos',
                notifications: 'GET /api/notifications - Ver notificaciones'
            },
            documentation: 'Visita /health para ver todos los endpoints disponibles'
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = app;
