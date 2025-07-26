import express from 'express';
import { 
  createCategory, 
  getAllCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory,
  getCategoryStats,
  getTopCategories,
  getEmptyCategories
} from '../controllers/categories/index.js';
import { protect as authenticateToken, admin } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// RUTAS PÚBLICAS
// ========================================

// Obtener todas las categorías
router.get('/', getAllCategories);

// Obtener categoría por ID
router.get('/:id', getCategoryById);

// Obtener categorías principales
router.get('/stats/top', getTopCategories);

// ========================================
// RUTAS DE ADMINISTRADOR

// ========================================

// CRUD básico
router.post('/', authenticateToken, admin, createCategory);
router.put('/:id', authenticateToken, admin, updateCategory);
router.delete('/:id', authenticateToken, admin, deleteCategory);

// Estadísticas y análisis
router.get('/admin/stats', authenticateToken, admin, getCategoryStats);
router.get('/admin/empty', authenticateToken, admin, getEmptyCategories);

export default router;
