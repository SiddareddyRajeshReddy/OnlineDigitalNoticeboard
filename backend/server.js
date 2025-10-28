import express from 'express'
import connection from './db/dbConnection.js'
import noticeBoardRouter from './routers/noticeBoardRoutes.js'
import cors from 'cors'
import authRouter from './routers/authRouters.js'
import cookieParser from 'cookie-parser'
import userRouter from './routers/userRouters.js'
const app = express()
const port = 5174
app.use(cors())
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
app.use("/api/auth", authRouter)
app.use("/api/notices",noticeBoardRouter)
app.use("/api/users", userRouter)
app.listen(port)