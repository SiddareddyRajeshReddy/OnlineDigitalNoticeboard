import express from 'express'
import connection from '../db/dbConnection.js';
export async function getAllAnnouncements(req, res) {
    const user = req.user
    const id = user.user_id
    const query = `SELECT color_code, title, content, url, image_url, status, expires_at, published_at, created_at, name, email, phone, department, designation 
                    FROM announcements
                    NATURAL JOIN category
                    NATURAL JOIN admin
                    WHERE announcements.Announcer_id=?`;
    const values = [id]
    connection.query(query, values, (error, result)=>{
        if(error)
        {
            return res.status(400).json({message: 'Error'})
        }
        return res.status(200).json({data: result})
    })
}

export async function createAnnouncements(req, res){
    const user = req.user
    const announcer_id = user?.user_id
    const { title, content, url, image_url, expires_at} = req.body
    
}