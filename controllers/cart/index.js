// Cart Controller - CRUD básico
export { 
  createCart, 
  getCart, 
  getMyCart,
  updateCart, 
  deleteCart, 
  getAllCarts 
} from './cartController.js';

// Items Controller - Gestión de items del carrito
export { 
  addItemToCart,
  addItemToMyCart,
  updateItemQuantity,
  updateItemQuantityInMyCart,
  removeItemFromCart,
  removeItemFromMyCart,
  clearCart,
  clearMyCart
} from './itemsController.js';

// Totals Controller - Cálculos y totales
export { 
  calculateCartTotals,
  calculateMyCartTotals,
  getCartSummary,
  getMyCartSummary,
  checkCartAvailability,
  checkMyCartAvailability
} from './totalsController.js'; 