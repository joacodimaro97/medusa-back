import express from 'express';
import {
  // Controlador principal
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  
  // Controlador de pagos
  updatePaymentStatus,
  getOrdersByPaymentStatus,
  getPaymentStats,
  
  // Controlador de envíos
  updateShippingStatus,
  getOrdersByShippingStatus,
  getShippingStats,
  getReadyToShipOrders,
  
  // Controlador de estadísticas
  getOrderOverview,
  getOrderStatsByPeriod,
  getTopProducts,
  getCustomerStats
} from '../controllers/orders/index.js';

import { protect as authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// RUTAS PÚBLICAS (Guest Checkout)
// ========================================

// POST /api/orders - Crear pedido (guest checkout)
router.post('/', createOrder);

// ========================================
// RUTAS AUTENTICADAS (Usuarios)
// ========================================

// GET /api/orders - Obtener pedidos del usuario
router.get('/', authenticateToken, getOrders);

// GET /api/orders/:id - Obtener pedido específico del usuario
router.get('/:id', authenticateToken, getOrderById);

// ========================================
// RUTAS DE ADMINISTRADOR
// ========================================

// GET /api/orders/admin/all - Obtener todos los pedidos (admin)
router.get('/admin/all', authenticateToken, getOrders);

// PUT /api/orders/:id - Actualizar pedido (admin)
router.put('/:id', authenticateToken, updateOrder);

// DELETE /api/orders/:id - Eliminar pedido (admin)
router.delete('/:id', authenticateToken, deleteOrder);

// ========================================
// RUTAS DE GESTIÓN DE PAGOS (Admin)
// ========================================

// PATCH /api/orders/:id/payment - Actualizar estado de pago
router.patch('/:id/payment', authenticateToken, updatePaymentStatus);

// GET /api/orders/payment/:status - Obtener pedidos por estado de pago
router.get('/payment/:status', authenticateToken, getOrdersByPaymentStatus);

// GET /api/orders/payment/stats - Estadísticas de pagos
router.get('/payment/stats', authenticateToken, getPaymentStats);

// ========================================
// RUTAS DE GESTIÓN DE ENVÍOS (Admin)
// ========================================

// PATCH /api/orders/:id/shipping - Actualizar estado de envío
router.patch('/:id/shipping', authenticateToken, updateShippingStatus);

// GET /api/orders/shipping/:status - Obtener pedidos por estado de envío
router.get('/shipping/:status', authenticateToken, getOrdersByShippingStatus);

// GET /api/orders/shipping/stats - Estadísticas de envíos
router.get('/shipping/stats', authenticateToken, getShippingStats);

// GET /api/orders/shipping/ready - Pedidos listos para enviar
router.get('/shipping/ready', authenticateToken, getReadyToShipOrders);

// ========================================
// RUTAS DE ESTADÍSTICAS (Admin)
// ========================================

// GET /api/orders/stats/overview - Estadísticas generales
router.get('/stats/overview', authenticateToken, getOrderOverview);

// GET /api/orders/stats/top-products - Productos más vendidos
router.get('/stats/top-products', authenticateToken, getTopProducts);

// GET /api/orders/stats/customers - Estadísticas de clientes
router.get('/stats/customers', authenticateToken, getCustomerStats);

export default router; 