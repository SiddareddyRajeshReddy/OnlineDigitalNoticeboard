import express from 'express'
import connection from './db/dbConnection.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routers/authRouters.js'
import announcementRouter from './routers/announcementsRouters.js'
import adminRouter from './routers/adminRouter.js'
import categoryRouter from './routers/categoryRouter.js'

const app = express()
const port = 5000

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    } else {
        console.log('Database connection successful');
    }
});

// Routes
app.use("/api/auth", authRouter)
app.use("/api/announcements", announcementRouter)
app.use("/api/admin", adminRouter)
app.use("/api/categories", categoryRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})