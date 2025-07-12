import express from 'express';
import { 
  createUser,
  getAllUsers,
  getUserById,
  getProfile,
  updateUser,
  updateProfile,
  changePassword,
  deleteUser,
  addToFavorites,
  removeFromFavorites,
  getFavorites
} from '../controllers/users/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/', createUser); // Registro de usuarios

// Rutas protegidas - Usuario autenticado
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.get('/favorites', authenticateToken, getFavorites);
router.post('/favorites/:productId', authenticateToken, addToFavorites);
router.delete('/favorites/:productId', authenticateToken, removeFromFavorites);

// Rutas protegidas - Solo administradores
router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.get('/:id', authenticateToken, requireAdmin, getUserById);
router.put('/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

export default router;
