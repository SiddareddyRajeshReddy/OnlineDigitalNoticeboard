import bcrypt from 'bcryptjs'
import connection from '../db/dbConnection.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config({ path: './backend/.env' });
//signup
export async function signup(req, res) {
    try {
        const { email, full_name, password, phone, role, department, designation } = req.body;

        // --- Basic validation ---
        if (!email || !full_name || !password || !phone || !role || !department || !designation) {
            return res.status(400).json({ error: "All fields are required!!!" });
        }

        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!pattern.test(email)) {
            return res.status(400).json({ error: "Invalid Email Format!!!" });
        }

        if (password.length <= 6) {
            return res.status(400).json({ error: "Password length should be greater than 6!!!" });
        }

        if (phone.length < 10) {
            return res.status(400).json({ error: "Phone number should be at least 10 digits!!!" });
        }

        // --- Hash password ---
        const salt = await bcrypt.genSalt(12);
        const hashPassword = await bcrypt.hash(password, salt);

        // --- Verify user existence ---
        const verifyQuery = 'SELECT * FROM users WHERE email = ? OR phone = ?';
        const verifyValues = [email, phone];

        connection.query(verifyQuery, verifyValues, (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database error during verification', error });
            }

            if (result.length > 0) {
                return res.status(400).json({ error: 'Already registered on this portal' });
            }

            const query = `
        INSERT INTO users(email, password, full_name, phone, role, department, designation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [email, hashPassword, full_name, phone, role, department, designation];

            connection.query(query, values, (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Database error during insert', error });
                }

                console.log(result);
                const userId = result.insertId;
                return res.status(200).json({ message: 'User added successfully', userId });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', e: error.message });
    }
}

//login
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // --- Basic validation ---
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required!!!" });
        }

        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!pattern.test(email)) {
            return res.status(400).json({ error: "Invalid Email Format!!!" });
        }

        if (password.length <= 6) {
            return res.status(400).json({ error: "Password length should be greater than 6!!!" });
        }

        const verifyQuery = 'SELECT * FROM users WHERE email = ?';
        const verifyValues = [email];

        connection.query(verifyQuery, verifyValues, async (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database error during verification', error });
            }

            if (result.length === 0) {
                return res.status(400).json({ error: 'Not Registered on the Portal' });
            }
            const user = result[0];
            const isAuthorised = await bcrypt.compare(password, user.password)
            if (!isAuthorised) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const KEY = process.env.KEY
            console.log(KEY)
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                KEY,
                { expiresIn: '7d' }
            );
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    designation: user.designation,
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', e: error.message });
    }
}