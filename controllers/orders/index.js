// Controlador principal de pedidos
export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from './orderController.js';

// Controlador de pagos
export {
  updatePaymentStatus,
  getOrdersByPaymentStatus,
  getPaymentStats
} from './paymentController.js';

// Controlador de envíos
export {
  updateShippingStatus,
  getOrdersByShippingStatus,
  getShippingStats,
  getReadyToShipOrders
} from './shippingController.js';

// Controlador de estadísticas
export {
  getOrderOverview,
  getOrderStatsByPeriod,
  getTopProducts,
  getCustomerStats
} from './statsController.js'; 