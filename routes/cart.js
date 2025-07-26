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
import { protect as authenticateToken, admin, optionalAuth } from '../middleware/auth.js';

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
router.post('/', authenticateToken, admin, createCart);
router.get('/admin/:cartId', authenticateToken, admin, getCart);
router.put('/admin/:cartId', authenticateToken, admin, updateCart);
router.delete('/admin/:cartId', authenticateToken, admin, deleteCart);
router.get('/admin', authenticateToken, admin, getAllCarts);

// Gestión de items (solo para gestión administrativa)
router.post('/admin/:cartId/items', authenticateToken, admin, addItemToCart);
router.put('/admin/:cartId/items/:productId', authenticateToken, admin, updateItemQuantity);
router.delete('/admin/:cartId/items/:productId', authenticateToken, admin, removeItemFromCart);
router.delete('/admin/:cartId/clear', authenticateToken, admin, clearCart);

// Cálculos y totales (solo para gestión administrativa)
router.get('/admin/:cartId/totals', authenticateToken, admin, calculateCartTotals);
router.get('/admin/:cartId/summary', authenticateToken, admin, getCartSummary);
router.get('/admin/:cartId/availability', authenticateToken, admin, checkCartAvailability);

export default router; 