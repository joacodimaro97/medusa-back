import express from 'express';
import { 
  // CRUD básico
  createCart,
  getCart,
  getMyCart,
  updateCart,
  deleteCart,
  getAllCarts,
  
  // Gestión de items
  addItemToCart,
  addItemToMyCart,
  updateItemQuantity,
  updateItemQuantityInMyCart,
  removeItemFromCart,
  removeItemFromMyCart,
  clearCart,
  clearMyCart,
  
  // Cálculos y totales
  calculateCartTotals,
  calculateMyCartTotals,
  getCartSummary,
  getMyCartSummary,
  checkCartAvailability,
  checkMyCartAvailability
} from '../controllers/cart/index.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// RUTAS PÚBLICAS
// ========================================

// Obtener carrito por userId o visitorId (para visitantes)
router.get('/public', getCart);

// ========================================
// RUTAS AUTENTICADAS (USUARIO)
// ========================================

// Obtener mi carrito (se crea automáticamente si no existe)
router.get('/my-cart', authenticateToken, getMyCart);

// Agregar producto a mi carrito
router.post('/my-cart/items', authenticateToken, addItemToMyCart);

// Actualizar cantidad en mi carrito
router.put('/my-cart/items/:productId', authenticateToken, updateItemQuantityInMyCart);

// Remover producto de mi carrito
router.delete('/my-cart/items/:productId', authenticateToken, removeItemFromMyCart);

// Limpiar mi carrito
router.delete('/my-cart/clear', authenticateToken, clearMyCart);

// Calcular totales de mi carrito
router.get('/my-cart/totals', authenticateToken, calculateMyCartTotals);

// Obtener resumen de mi carrito
router.get('/my-cart/summary', authenticateToken, getMyCartSummary);

// Verificar disponibilidad de mi carrito
router.get('/my-cart/availability', authenticateToken, checkMyCartAvailability);

// ========================================
// RUTAS DE ADMINISTRADOR
// ========================================

// CRUD básico (solo para gestión administrativa)
router.post('/', authenticateToken, requireAdmin, createCart);
router.get('/admin/:cartId', authenticateToken, requireAdmin, getCart);
router.put('/admin/:cartId', authenticateToken, requireAdmin, updateCart);
router.delete('/admin/:cartId', authenticateToken, requireAdmin, deleteCart);
router.get('/admin', authenticateToken, requireAdmin, getAllCarts);

// Gestión de items (solo para gestión administrativa)
router.post('/admin/:cartId/items', authenticateToken, requireAdmin, addItemToCart);
router.put('/admin/:cartId/items/:productId', authenticateToken, requireAdmin, updateItemQuantity);
router.delete('/admin/:cartId/items/:productId', authenticateToken, requireAdmin, removeItemFromCart);
router.delete('/admin/:cartId/clear', authenticateToken, requireAdmin, clearCart);

// Cálculos y totales (solo para gestión administrativa)
router.get('/admin/:cartId/totals', authenticateToken, requireAdmin, calculateCartTotals);
router.get('/admin/:cartId/summary', authenticateToken, requireAdmin, getCartSummary);
router.get('/admin/:cartId/availability', authenticateToken, requireAdmin, checkCartAvailability);

export default router; 