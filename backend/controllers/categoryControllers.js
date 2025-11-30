import connection from '../db/dbConnection.js';

// Get all approved categories (Public)
export async function getAllCategories(req, res) {
    const query = `
        SELECT 
            category_id,
            name,
            dept_associated,
            color_code,
            created_at
        FROM Category
        WHERE status = 'approved'
        ORDER BY name ASC
    `;
    
    connection.query(query, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        return res.status(200).json({ data: result });
    });
}

// Get category by ID
export async function getCategoryById(req, res) {
    const { id } = req.params;
    
    const query = `
        SELECT 
            c.*,
            com.full_name AS created_by_name,
            admin.name AS approved_by_name
        FROM Category c
        LEFT JOIN Committee com ON c.created_by = com.committee_id
        LEFT JOIN Admin admin ON c.approved_by = admin.admin_id
        WHERE c.category_id = ?
    `;
    
    connection.query(query, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json({ data: result[0] });
    });
}

// Create new category (Committee)
export async function createCategory(req, res) {
    const user = req.user;
    const { name, dept_associated, color_code } = req.body;
    
    if (!name || !dept_associated) {
        return res.status(400).json({ error: 'Name and department are required' });
    }
    
    if (dept_associated.length > 4) {
        return res.status(400).json({ error: 'Department code must be 4 characters or less' });
    }
    
    const query = `
        INSERT INTO Category (name, dept_associated, created_by, color_code, status)
        VALUES (?, ?, ?, ?, 'pending')
    `;
    const values = [
        name,
        dept_associated.toUpperCase(),
        user.committee_id,
        color_code || '#6b7280'
    ];
    
    connection.query(query, values, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        return res.status(201).json({
            message: 'Category created successfully. Awaiting admin approval.',
            categoryId: result.insertId
        });
    });
}

// Update category (Committee - only their own pending categories)
export async function updateCategory(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { name, dept_associated, color_code } = req.body;
    
    // Check if category belongs to user and is pending
    const checkQuery = `
        SELECT * FROM Category 
        WHERE category_id = ? AND created_by = ? AND status = 'pending'
    `;
    
    connection.query(checkQuery, [id, user.committee_id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ 
                message: 'Category not found, unauthorized, or already approved' 
            });
        }
        
        const updateQuery = `
            UPDATE Category 
            SET name = ?, dept_associated = ?, color_code = ?
            WHERE category_id = ?
        `;
        const values = [
            name || result[0].name,
            dept_associated ? dept_associated.toUpperCase() : result[0].dept_associated,
            color_code || result[0].color_code,
            id
        ];
        
        connection.query(updateQuery, values, (error, updateResult) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database error', error: error.message });
            }
            return res.status(200).json({ message: 'Category updated successfully' });
        });
    });
}

// Get my categories (Committee)
export async function getMyCategories(req, res) {
    const user = req.user;
    
    const query = `
        SELECT 
            c.*,
            admin.name AS approved_by_name
        FROM Category c
        LEFT JOIN Admin admin ON c.approved_by = admin.admin_id
        WHERE c.created_by = ?
        ORDER BY c.created_at DESC
    `;
    
    connection.query(query, [user.committee_id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        return res.status(200).json({ data: result });
    });
}

// Get pending categories (Admin)
export async function getPendingCategories(req, res) {
    const query = `
        SELECT 
            c.*,
            com.full_name AS created_by_name,
            com.email AS created_by_email
        FROM Category c
        LEFT JOIN Committee com ON c.created_by = com.committee_id
        WHERE c.status = 'pending'
        ORDER BY c.created_at DESC
    `;
    
    connection.query(query, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        return res.status(200).json({ data: result });
    });
}

// Approve category (Admin)
export async function approveCategory(req, res) {
    const { id } = req.params;
    const adminId = req.user.admin_id;
    
    const query = `
        UPDATE Category 
        SET status = 'approved', approved_by = ?
        WHERE category_id = ? AND status = 'pending'
    `;
    
    connection.query(query, [adminId, id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'Category not found or already approved' 
            });
        }
        return res.status(200).json({ message: 'Category approved successfully' });
    });
}

// Reject/Delete category (Admin)
export async function rejectCategory(req, res) {
    const { id } = req.params;
    
    const query = `
        UPDATE Category 
        SET status = 'rejected'
        WHERE category_id = ? AND status = 'pending'
    `;
    
    connection.query(query, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'Category not found or already processed' 
            });
        }
        return res.status(200).json({ message: 'Category rejected successfully' });
    });
}

// Delete approved category (Admin only)
export async function deleteCategory(req, res) {
    const { id } = req.params;
    
    // Check if category has announcements
    const checkQuery = `SELECT COUNT(*) as count FROM Announcements WHERE category_id = ?`;
    
    connection.query(checkQuery, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        
        if (result[0].count > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete category with existing announcements' 
            });
        }
        
        const deleteQuery = `DELETE FROM Category WHERE category_id = ?`;
        
        connection.query(deleteQuery, [id], (error, deleteResult) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database error', error: error.message });
            }
            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }
            return res.status(200).json({ message: 'Category deleted successfully' });
        });
    });
}