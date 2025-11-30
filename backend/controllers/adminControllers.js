import bcrypt from 'bcryptjs';
import connection from '../db/dbConnection.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Add new admin (Admin only - protected route)
export async function addNewAdmin(req, res) {
    try {
        const { email, name, password, phone } = req.body;

        // --- Basic validation ---
        if (!email || !name || !password) {
            return res.status(400).json({ error: "Email, name, and password are required!!!" });
        }

        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!pattern.test(email)) {
            return res.status(400).json({ error: "Invalid Email Format!!!" });
        }

        if (password.length <= 6) {
            return res.status(400).json({ error: "Password length should be greater than 6!!!" });
        }

        if (phone && phone.length < 10) {
            return res.status(400).json({ error: "Phone number should be at least 10 digits!!!" });
        }

        // --- Hash password ---
        const salt = await bcrypt.genSalt(12);
        const hashPassword = await bcrypt.hash(password, salt);

        // --- Verify admin existence ---
        const verifyQuery = 'SELECT * FROM Admin WHERE email = ? OR phone = ?';
        const verifyValues = [email, phone || ''];

        connection.query(verifyQuery, verifyValues, (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database error during verification', error: error.message });
            }

            if (result.length > 0) {
                return res.status(400).json({ error: 'Admin already exists with this email or phone' });
            }

            const query = `
                INSERT INTO Admin(email, name, password, phone)
                VALUES (?, ?, ?, ?)
            `;
            const values = [email, name, hashPassword, phone || null];

            connection.query(query, values, (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Database error during insert', error: error.message });
                }

                console.log(result);
                const adminId = result.insertId;
                return res.status(200).json({ 
                    message: 'New admin added successfully', 
                    adminId 
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', e: error.message });
    }
}

// Admin login
export async function adminLogin(req, res) {
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

        const verifyQuery = 'SELECT * FROM Admin WHERE email = ?';
        const verifyValues = [email];

        connection.query(verifyQuery, verifyValues, async (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database error during verification', error: error.message });
            }

            if (result.length === 0) {
                return res.status(400).json({ error: 'Admin not found' });
            }

            const admin = result[0];
            const isAuthorised = await bcrypt.compare(password, admin.password);
            if (!isAuthorised) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const KEY = process.env.KEY;
            console.log(KEY);
            const token = jwt.sign(
                { 
                    id: admin.admin_id, 
                    email: admin.email, 
                    type: 'admin' 
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
                message: 'Admin login successful',
                user: {
                    id: admin.admin_id,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone,
                    type: 'admin'
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', e: error.message });
    }
}

export async function getPendingCommittees(req, res) {
    const query = `
        SELECT committee_id, full_name, email, phone, created_at 
        FROM Committee 
        WHERE is_active = 'not approved'
        ORDER BY created_at DESC
    `;
    
    connection.query(query, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        return res.status(200).json({ data: result });
    });
}

// Approve committee member
export async function approveCommittee(req, res) {
    const { id } = req.params;
    
    const query = `UPDATE Committee SET is_active = 'approved' WHERE committee_id = ?`;
    
    connection.query(query, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Committee member not found' });
        }
        return res.status(200).json({ message: 'Committee member approved successfully' });
    });
}

// Reject (delete) committee member
export async function rejectCommittee(req, res) {
    const { id } = req.params;
    
    const query = `DELETE FROM Committee WHERE committee_id = ? AND is_active = 'not approved'`;
    
    connection.query(query, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Committee member not found or already approved' });
        }
        return res.status(200).json({ message: 'Committee member rejected' });
    });
}

// Get pending announcements
export async function getPendingAnnouncements(req, res) {
    const query = `
        SELECT 
            a.announcement_id,
            a.title,
            a.content,
            a.url,
            a.priority,
            a.created_at,
            a.expires_at,
            c.name AS category_name,
            c.color_code,
            com.full_name AS announcer_name,
            com.email AS announcer_email
        FROM Announcements a
        LEFT JOIN Category c ON a.category_id = c.category_id
        LEFT JOIN Committee com ON a.announcer_id = com.committee_id
        WHERE a.status = 'pending'
        ORDER BY a.created_at DESC
    `;
    
    connection.query(query, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        return res.status(200).json({ data: result });
    });
}

// Approve announcement (set to published)
export async function approveAnnouncement(req, res) {
    const { id } = req.params;
    const adminId = req.user.admin_id;
    
    const query = `
        UPDATE Announcements 
        SET status = 'published', 
            approved_by = ?, 
            published_at = NOW() 
        WHERE announcement_id = ? AND status = 'pending'
    `;
    
    connection.query(query, [adminId, id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Announcement not found or not pending' });
        }
        return res.status(200).json({ message: 'Announcement approved and published' });
    });
}

// Reject announcement
export async function rejectAnnouncement(req, res) {
    const { id } = req.params;
    const adminId = req.user.admin_id;
    
    const query = `
        UPDATE Announcements 
        SET status = 'rejected', 
            approved_by = ?
        WHERE announcement_id = ? AND status = 'pending'
    `;
    
    connection.query(query, [adminId, id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Announcement not found or not pending' });
        }
        return res.status(200).json({ message: 'Announcement rejected' });
    });
}

// Admin logout
export async function adminLogout(req, res) {
    if (req.cookies.auth_token) {
        res.clearCookie('auth_token');
    }
    res.status(200).json({ message: 'Admin logged out successfully' });
}