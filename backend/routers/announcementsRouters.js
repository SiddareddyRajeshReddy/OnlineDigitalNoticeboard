import express from "express";
import middleWare, { committeeOnly, adminOnly } from "../middleware/authMiddleware.js";
import { 
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getMyAnnouncements,
    publishAnnouncement,
    getPublishedAnnouncements,
    getAnnouncementsByCategory,
    getAnnouncementsByStatus
} from "../controllers/announcementsControllers.js";

const announcementRouter = express.Router();

// Public routes (no authentication required)
announcementRouter.get('/published', getPublishedAnnouncements);
announcementRouter.get('/category/:categoryId', getAnnouncementsByCategory);

// Protected routes (authentication required)
// Get current user's announcements - must be before /:id route
announcementRouter.get('/my/announcements', middleWare, committeeOnly, getMyAnnouncements);

// Get announcements by status
announcementRouter.get('/status/:status', middleWare, committeeOnly, getAnnouncementsByStatus);

// Get all announcements for committee member
announcementRouter.get('/', middleWare, committeeOnly, getAllAnnouncements);

// Get single announcement by ID
announcementRouter.get('/:id', middleWare, getAnnouncementById);

// Create new announcement (committee only)
announcementRouter.post('/create', middleWare, committeeOnly, createAnnouncement);

// Update announcement (committee only)
announcementRouter.put('/update/:id', middleWare, committeeOnly, updateAnnouncement);

// Submit announcement for approval (draft -> pending) - Committee members
announcementRouter.patch('/publish/:id', middleWare, committeeOnly, publishAnnouncement);

// Delete announcement - Admin only
announcementRouter.delete('/delete/:id', middleWare, adminOnly, deleteAnnouncement);

export default announcementRouter;