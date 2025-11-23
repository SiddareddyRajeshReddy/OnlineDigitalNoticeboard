import express from 'express';
import { 
    adminLogin, 
    adminLogout, 
    addNewAdmin,
    getPendingCommittees,
    approveCommittee,
    rejectCommittee,
    getPendingAnnouncements,
    approveAnnouncement,
    rejectAnnouncement
} from '../controllers/adminControllers.js';
import middleWare, { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);
router.post('/logout', adminLogout);

// Protected admin-only routes
router.post('/add-admin', middleWare, adminOnly, addNewAdmin);

// Committee management
router.get('/committees/pending', middleWare, adminOnly, getPendingCommittees);
router.patch('/committees/:id/approve', middleWare, adminOnly, approveCommittee);
router.delete('/committees/:id/reject', middleWare, adminOnly, rejectCommittee);

// Announcement management
router.get('/announcements/pending', middleWare, adminOnly, getPendingAnnouncements);
router.patch('/announcements/:id/approve', middleWare, adminOnly, approveAnnouncement);
router.patch('/announcements/:id/reject', middleWare, adminOnly, rejectAnnouncement);

export default router;