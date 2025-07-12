// Product Controller - CRUD básico
export { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from './productController.js';

// Stock Controller - Gestión de inventario
export { 
  updateStock, 
  getLowStockProducts, 
  getOutOfStockProducts, 
  checkAvailability 
} from './stockController.js';

// Discount Controller - Gestión de descuentos
export { 
  applyDiscount, 
  removeDiscount, 
  getDiscountedProducts, 
  applyBulkDiscount 
} from './discountController.js';

// Featured Controller - Productos destacados
export { 
  markAsFeatured, 
  removeFromFeatured, 
  getFeaturedProducts, 
  markMultipleAsFeatured 
} from './featuredController.js'; 