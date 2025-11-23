import bcrypt from 'bcryptjs'
import connection from '../db/dbConnection.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();
console.log("KEY:", process.env.KEY);

// Committee signup
export async function signup(req, res) {
    try {
        const { email, full_name, password, phone } = req.body;

        // --- Basic validation ---
        if (!email || !full_name || !password || !phone) {
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

        // --- Verify committee existence ---
        const verifyQuery = 'SELECT * FROM Committee WHERE email = ? OR phone = ?';
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
                INSERT INTO Committee(email, password, full_name, phone, is_active)
                VALUES (?, ?, ?, ?, 'not approved')
            `;
            const values = [email, hashPassword, full_name, phone];

            connection.query(query, values, (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Database error during insert', error });
                }

                console.log(result);
                const committeeId = result.insertId;
                return res.status(200).json({ 
                    message: 'Committee member registered successfully. Awaiting admin approval.', 
                    committeeId 
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', e: error.message });
    }
}

// Committee login
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

        const verifyQuery = 'SELECT * FROM Committee WHERE email = ?';
        const verifyValues = [email];

        connection.query(verifyQuery, verifyValues, async (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database error during verification', error });
            }

            if (result.length === 0) {
                return res.status(400).json({ error: 'Not Registered on the Portal' });
            }

            const committee = result[0];

            // Check if committee is approved
            if (committee.is_active === 'not approved') {
                return res.status(403).json({ error: 'Your account is pending admin approval' });
            }

            const isAuthorised = await bcrypt.compare(password, committee.password);
            if (!isAuthorised) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const KEY = process.env.KEY;
            console.log(KEY);
            const token = jwt.sign(
                { 
                    id: committee.committee_id, 
                    email: committee.email, 
                    type: 'committee' 
                },
                KEY,
                { expiresIn: '7d' }
            );

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: committee.committee_id,
                    full_name: committee.full_name,
                    email: committee.email,
                    phone: committee.phone,
                    type: 'committee'
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', e: error.message });
    }
}

// Logout
export async function logout(req, res) {
    if (req.cookies.auth_token) {
        res.clearCookie('auth_token');
    }
    res.status(200).json({ message: 'Logged out successfully' });
}