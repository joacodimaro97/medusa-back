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
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

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
router.post('/', authenticateToken, requireAdmin, createCategory);
router.put('/:id', authenticateToken, requireAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

// Estadísticas y análisis
router.get('/admin/stats', authenticateToken, requireAdmin, getCategoryStats);
router.get('/admin/empty', authenticateToken, requireAdmin, getEmptyCategories);

export default router; 