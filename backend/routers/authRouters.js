import express from 'express';
import { signup, login, logout } from '../controllers/authControllers.js';
import middleWare from '../middleware/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

authRouter.get('/user', middleWare, (req, res) => {
    if (req.userType === 'committee') {
        return res.status(200).json({
            user: {
                id: req.user.committee_id,
                full_name: req.user.full_name,
                email: req.user.email,
                phone: req.user.phone,
                type: 'committee'  // <-- This is what frontend needs
            }
        });
    } else if (req.userType === 'admin') {
        return res.status(200).json({
            user: {
                id: req.user.admin_id,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                type: 'admin'  // <-- This is what frontend needs
            }
        });
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
});

export default authRouter;