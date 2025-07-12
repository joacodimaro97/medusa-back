import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a la API de Medusa',
    version: '1.0.0',
    endpoints: {
      products: '/products',
      users: '/users',
      auth: '/auth',
      categories: '/categories',
      cart: '/cart',
      orders: '/orders'
    }
  });
});

/* GET health check */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;
