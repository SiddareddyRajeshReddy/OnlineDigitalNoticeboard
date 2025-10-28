import express from 'express'
import jwt from 'jsonwebtoken'
import connection from '../db/dbConnection.js'
import dotenv from 'dotenv'
dotenv.config()

export default async function middleWare(req, res, next){

    try{
        const token =  req.cookies.auth_token;
        if(!token){
            return res.status(401).json({message: "Unauthorised"})
        }
        const {id, email, role} = jwt.verify(token, process.env.KEY)
        if(!email)
        {
            return res.status(401).json({message: "unauhtorised"})
        }
        const query = 'SELECT user_id, full_name, email, phone, designation, department, created_at, role FROM users where email = ? LIMIT 1'
        const values = [email]
        connection.query(query, values, async (error, result)=>{
            if(error)
            {
                return res.status(401).json({message: "Internal Error"})
            }
            if(result.length < 1)
            {
                return res.status(401).json({message: "Unauthorised User"})
            }
            const user = result[0];
            req.user = user
            next()
        })
    }
    catch(error)
    {
          console.log(error)
        res.status(500).json({message: "Internal Server Error"})
          
    }
}