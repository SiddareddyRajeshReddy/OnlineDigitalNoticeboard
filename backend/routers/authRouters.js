import express from 'express'
const authRouter = express.Router()
import { signup, login } from '../controllers/authControllers.js'
authRouter.post('/signup', (req, res)=>{
    signup(req, res)
})
authRouter.post('/login', (req, res)=>{
    login(req, res)
})
authRouter.post('/logout', ()=>{
    
})

export default authRouter