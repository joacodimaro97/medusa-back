import express from 'express';
import { 
  // CRUD básico
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  
  // Gestión de stock
  updateStock,
  getLowStockProducts,
  getOutOfStockProducts,
  checkAvailability,
  
  // Gestión de descuentos
  applyDiscount,
  removeDiscount,
  getDiscountedProducts,
  applyBulkDiscount,
  
  // Productos destacados
  markAsFeatured,
  removeFromFeatured,
  getFeaturedProducts,
  markMultipleAsFeatured
} from '../controllers/products/index.js';
import { protect as authenticateToken, admin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// RUTAS PÚBLICAS
// ========================================

// Obtener todos los productos (con filtros)
router.get('/', getAllProducts);

// Obtener producto por ID
router.get('/:id', getProductById);

// Obtener productos destacados
router.get('/featured/list', getFeaturedProducts);

// Obtener productos con descuento
router.get('/discounted/list', getDiscountedProducts);

// Verificar disponibilidad de producto
router.get('/:id/availability', checkAvailability);

// ========================================
// RUTAS AUTENTICADAS (OPCIONAL)
// ========================================

// Obtener productos con información adicional para usuarios autenticados
router.get('/auth/enhanced', optionalAuth, getAllProducts);

// ========================================
// RUTAS DE ADMINISTRADOR
// ========================================

// CRUD básico (solo admin)
router.post('/', authenticateToken, admin, createProduct);
router.put('/:id', authenticateToken, admin, updateProduct);
router.delete('/:id', authenticateToken, admin, deleteProduct);

// Gestión de stock (solo admin)
router.put('/:id/stock', authenticateToken, admin, updateStock);
router.get('/admin/low-stock', authenticateToken, admin, getLowStockProducts);
router.get('/admin/out-of-stock', authenticateToken, admin, getOutOfStockProducts);

// Gestión de descuentos (solo admin)
router.put('/:id/discount', authenticateToken, admin, applyDiscount);
router.delete('/:id/discount', authenticateToken, admin, removeDiscount);
router.post('/admin/bulk-discount', authenticateToken, admin, applyBulkDiscount);

// Gestión de productos destacados (solo admin)
router.put('/:id/featured', authenticateToken, admin, markAsFeatured);
router.delete('/:id/featured', authenticateToken, admin, removeFromFeatured);
router.post('/admin/bulk-featured', authenticateToken, admin, markMultipleAsFeatured);

export default router; 