import express from 'express'
const authRouter = express.Router()
import { signup, login, logout } from '../controllers/authControllers.js'
import middleWare from '../middleware/authMiddleware.js'
authRouter.post('/signup', (req, res)=>{
    signup(req, res)
})
authRouter.post('/login', (req, res)=>{
    login(req, res)
})
authRouter.post('/logout', (req, res)=>{
    logout(req, res)
})
authRouter.get('/user', middleWare, (req, res)=>{
     res.status(200).json({success: true, user: req.user});
})

export default authRouter