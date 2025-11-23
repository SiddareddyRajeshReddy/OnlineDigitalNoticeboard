import jwt from 'jsonwebtoken'
import connection from '../db/dbConnection.js'
import dotenv from 'dotenv'
dotenv.config()

// Main authentication middleware
export default async function middleWare(req, res, next) {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id, email, type } = jwt.verify(token, process.env.KEY);
        if (!email || !type) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if user is committee member
        if (type === 'committee') {
            const query = `
                SELECT committee_id, full_name, email, phone, is_active, created_at, updated_at 
                FROM Committee 
                WHERE email = ? 
                LIMIT 1
            `;
            const values = [email];

            connection.query(query, values, async (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: "Internal Error" });
                }
                if (result.length < 1) {
                    return res.status(401).json({ message: "Unauthorized User" });
                }

                const committee = result[0];

                // Check if committee member is approved
                if (committee.is_active !== 'approved') {
                    return res.status(403).json({ message: "Account not approved by admin" });
                }

                req.user = committee;
                req.userType = 'committee';
                next();
            });
        } 
        // Check if user is admin
        else if (type === 'admin') {
            const query = `
                SELECT admin_id, name, email, phone 
                FROM Admin 
                WHERE email = ? 
                LIMIT 1
            `;
            const values = [email];

            connection.query(query, values, async (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: "Internal Error" });
                }
                if (result.length < 1) {
                    return res.status(401).json({ message: "Unauthorized User" });
                }

                req.user = result[0];
                req.userType = 'admin';
                next();
            });
        } 
        else {
            return res.status(401).json({ message: "Invalid user type" });
        }
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Middleware to allow only committee members
export function committeeOnly(req, res, next) {
    if (req.userType !== 'committee') {
        return res.status(403).json({ message: "Access denied. Committee members only." });
    }
    next();
}

// Middleware to allow only admins
export function adminOnly(req, res, next) {
    if (req.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
}