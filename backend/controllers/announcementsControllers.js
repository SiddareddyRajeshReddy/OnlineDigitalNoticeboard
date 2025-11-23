import connection from '../db/dbConnection.js';

// Get all announcements for the logged-in committee member
export async function getAllAnnouncements(req, res) {
    const user = req.user;
    const id = user.committee_id;
    
    const query = `
        SELECT 
            a.announcement_id,
            a.title,
            a.content,
            a.url,
            a.status,
            a.priority,
            a.expires_at,
            a.published_at,
            a.created_at,
            a.updated_at,
            c.name AS category_name,
            c.color_code,
            c.image_url,
            c.dept_associated,
            admin.name AS approved_by_name
        FROM Announcements a
        LEFT JOIN Category c ON a.category_id = c.category_id
        LEFT JOIN Admin admin ON a.approved_by = admin.admin_id
        WHERE a.announcer_id = ?
        ORDER BY a.created_at DESC
    `;
    const values = [id];
    
    connection.query(query, values, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error });
        }
        return res.status(200).json({ data: result });
    });
}

// Get announcement by ID
export async function getAnnouncementById(req, res) {
    const { id } = req.params;
    
    const query = `
        SELECT 
            a.*,
            c.name AS category_name,
            c.color_code,
            c.image_url,
            c.dept_associated,
            com.full_name AS announcer_name,
            com.email AS announcer_email,
            admin.name AS approved_by_name
        FROM Announcements a
        LEFT JOIN Category c ON a.category_id = c.category_id
        LEFT JOIN Committee com ON a.announcer_id = com.committee_id
        LEFT JOIN Admin admin ON a.approved_by = admin.admin_id
        WHERE a.announcement_id = ?
    `;
    
    connection.query(query, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        return res.status(200).json({ data: result[0] });
    });
}

// Create new announcement
export async function createAnnouncement(req, res) {
    const user = req.user;
    const announcer_id = user?.committee_id;
    const { title, content, url, category_id, priority, expires_at } = req.body;
    
    // Validation
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const query = `
        INSERT INTO Announcements (
            title, 
            content, 
            url, 
            category_id, 
            priority, 
            status, 
            announcer_id, 
            created_by, 
            expires_at
        ) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?)
    `;
    const values = [
        title, 
        content, 
        url || null, 
        category_id || null, 
        priority || 'medium', 
        announcer_id, 
        announcer_id, 
        expires_at || null
    ];
    
    connection.query(query, values, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error during insert', error });
        }
        return res.status(201).json({ 
            message: 'Announcement created successfully', 
            announcementId: result.insertId 
        });
    });
}

// Update announcement
export async function updateAnnouncement(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { title, content, url, category_id, priority, status, expires_at } = req.body;
    
    // First check if announcement belongs to user
    const checkQuery = 'SELECT * FROM Announcements WHERE announcement_id = ? AND announcer_id = ?';
    
    connection.query(checkQuery, [id, user.committee_id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Announcement not found or unauthorized' });
        }
        
        const updateQuery = `
            UPDATE Announcements 
            SET title = ?, 
                content = ?, 
                url = ?, 
                category_id = ?, 
                priority = ?, 
                status = ?,
                expires_at = ?
            WHERE announcement_id = ?
        `;
        const values = [
            title || result[0].title,
            content || result[0].content,
            url !== undefined ? url : result[0].url,
            category_id !== undefined ? category_id : result[0].category_id,
            priority || result[0].priority,
            status || result[0].status,
            expires_at !== undefined ? expires_at : result[0].expires_at,
            id
        ];
        
        connection.query(updateQuery, values, (error, updateResult) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database error during update', error });
            }
            return res.status(200).json({ message: 'Announcement updated successfully' });
        });
    });
}

// Get current user's announcements
export async function getMyAnnouncements(req, res) {
    const user = req.user;
    
    const query = `
        SELECT 
            a.*,
            c.name AS category_name,
            c.color_code,
            c.dept_associated
        FROM Announcements a
        LEFT JOIN Category c ON a.category_id = c.category_id
        WHERE a.created_by = ?
        ORDER BY a.created_at DESC
    `;
    
    connection.query(query, [user.committee_id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error });
        }
        return res.status(200).json({ data: result });
    });
}

// Publish announcement (change status to pending for admin approval)
export async function publishAnnouncement(req, res) {
    const user = req.user;
    const { id } = req.params;
    
    const query = `
        UPDATE Announcements 
        SET status = 'pending' 
        WHERE announcement_id = ? AND announcer_id = ? AND status = 'draft'
    `;
    
    connection.query(query, [id, user.committee_id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Announcement not found, unauthorized, or already submitted' });
        }
        return res.status(200).json({ message: 'Announcement submitted for approval' });
    });
}

// Delete announcement (Admin only)
export async function deleteAnnouncement(req, res) {
    // Check if user is admin
    if (req.userType !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Only admins can delete announcements.' });
    }
    
    const { id } = req.params;
    
    const query = 'DELETE FROM Announcements WHERE announcement_id = ?';
    
    connection.query(query, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        return res.status(200).json({ message: 'Announcement deleted successfully' });
    });
}
export async function getPublishedAnnouncements(req, res) {
    const query = `
        SELECT 
            a.announcement_id,
            a.title,
            a.content,
            a.url,
            a.priority,
            a.published_at,
            a.expires_at,
            c.name AS category_name,
            c.color_code,
            c.image_url,
            c.dept_associated,
            com.full_name AS announcer_name
        FROM Announcements a
        LEFT JOIN Category c ON a.category_id = c.category_id
        LEFT JOIN Committee com ON a.announcer_id = com.committee_id
        WHERE a.status = 'published' 
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
        ORDER BY a.priority DESC, a.published_at DESC
    `;
    
    connection.query(query, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error });
        }
        return res.status(200).json({ data: result });
    });
}

// Get announcements by category
export async function getAnnouncementsByCategory(req, res) {
    const { categoryId } = req.params;
    
    const query = `
        SELECT 
            a.announcement_id,
            a.title,
            a.content,
            a.url,
            a.priority,
            a.published_at,
            a.expires_at,
            c.name AS category_name,
            c.color_code,
            c.dept_associated,
            com.full_name AS announcer_name
        FROM Announcements a
        LEFT JOIN Category c ON a.category_id = c.category_id
        LEFT JOIN Committee com ON a.announcer_id = com.committee_id
        WHERE a.category_id = ? 
        AND a.status = 'published'
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
        ORDER BY a.published_at DESC
    `;
    
    connection.query(query, [categoryId], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error });
        }
        return res.status(200).json({ data: result });
    });
}

// Get announcements by status
export async function getAnnouncementsByStatus(req, res) {
    const user = req.user;
    const { status } = req.params;
    
    const validStatuses = ['draft', 'pending', 'approved', 'rejected', 'published'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    const query = `
        SELECT 
            a.*,
            c.name AS category_name,
            c.color_code,
            c.dept_associated
        FROM Announcements a
        LEFT JOIN Category c ON a.category_id = c.category_id
        WHERE a.announcer_id = ? AND a.status = ?
        ORDER BY a.created_at DESC
    `;
    
    connection.query(query, [user.committee_id, status], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error });
        }
        return res.status(200).json({ data: result });
    });
}