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


const router = express.Router();

// Rutas públicas
router.post('/', createUser); // Registro de usuarios

// Rutas protegidas - Usuario autenticado
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/favorites', getFavorites);
router.post('/favorites/:productId', addToFavorites);
router.delete('/favorites/:productId', removeFromFavorites);

// Rutas protegidas - Solo administradores
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
