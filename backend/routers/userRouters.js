import express from "express";
import middleWare from "../middleware/authMiddleware.js";
import { getAllAnnouncements } from "../controllers/userControllers.js";
const userRouter = express.Router()

userRouter.use(middleWare)

userRouter.get('/', (req, res)=>{
    getAllAnnouncements(req, res)
})

userRouter.get('/create-announcement', (req, res)=>{
    
})

export default userRouter