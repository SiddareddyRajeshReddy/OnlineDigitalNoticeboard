import express from 'express'
import connection from './db/dbConnection.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routers/authRouters.js'
import announcementRouter from './routers/announcementsRouters.js'
import adminRouter from './routers/adminRouter.js'
import categoryRouter from './routers/categoryRouter.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()
const port = 5000

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// Body parsers
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// Database connection
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    } else {
        console.log('Database connection successful');
    }
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRouter)
app.use("/api/announcements", announcementRouter)
app.use("/api/admin", adminRouter)
app.use("/api/categories", categoryRouter)

// 404 handler - must be after all routes
app.use(notFoundHandler)

// Global error handler - must be last
app.use(errorHandler)

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    connection.end(() => {
        console.log('Database connection closed');
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})