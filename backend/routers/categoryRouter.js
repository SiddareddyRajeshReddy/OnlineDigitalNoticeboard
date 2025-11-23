import express from 'express';
import middleWare, { committeeOnly, adminOnly } from '../middleware/authMiddleware.js';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    getMyCategories,
    getPendingCategories,
    approveCategory,
    rejectCategory,
    deleteCategory
} from '../controllers/categoryControllers.js';

const categoryRouter = express.Router();

// Public routes
categoryRouter.get('/', getAllCategories);

// Admin routes (must be before /:id)
categoryRouter.get('/admin/pending', middleWare, adminOnly, getPendingCategories);

// Committee routes (must be before /:id)
categoryRouter.get('/my/categories', middleWare, committeeOnly, getMyCategories);
categoryRouter.post('/create', middleWare, committeeOnly, createCategory);
categoryRouter.put('/update/:id', middleWare, committeeOnly, updateCategory);

// Parameterized routes (must be last)
categoryRouter.get('/:id', getCategoryById);
categoryRouter.patch('/:id/approve', middleWare, adminOnly, approveCategory);
categoryRouter.delete('/:id/reject', middleWare, adminOnly, rejectCategory);
categoryRouter.delete('/:id', middleWare, adminOnly, deleteCategory);

export default categoryRouter;