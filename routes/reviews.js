import express from 'express';
import {
  // Controlador principal
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getProductReviews,
  
  // Controlador de ratings
  getProductRatingStats,
  getTopRatedProducts,
  getReviewsByRating,
  getRatingStats,
  
  // Controlador de moderación
  getPendingReviews,
  approveReview,
  rejectReview,
  getModerationStats,
  getReviewsByModerationStatus
} from '../controllers/reviews/index.js';

import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// RUTAS PÚBLICAS
// ========================================

// GET /api/reviews - Obtener todas las reseñas (con filtros)
router.get('/', getReviews);

// GET /api/reviews/:id - Obtener reseña específica
router.get('/:id', getReviewById);

// GET /api/reviews/product/:productId - Obtener reseñas de un producto
router.get('/product/:productId', getProductReviews);

// ========================================
// RUTAS DE RATINGS Y ESTADÍSTICAS (Públicas)
// ========================================

// GET /api/reviews/ratings/product/:productId - Estadísticas de ratings por producto
router.get('/ratings/product/:productId', getProductRatingStats);

// GET /api/reviews/ratings/top-products - Productos mejor calificados
router.get('/ratings/top-products', getTopRatedProducts);

// GET /api/reviews/ratings/:rating - Reseñas por rating específico
router.get('/ratings/:rating', getReviewsByRating);

// GET /api/reviews/ratings/stats - Estadísticas generales de ratings
router.get('/ratings/stats', getRatingStats);

// ========================================
// RUTAS AUTENTICADAS (Usuarios)
// ========================================

// POST /api/reviews - Crear reseña
router.post('/', protect, createReview);

// PUT /api/reviews/:id - Actualizar reseña propia
router.put('/:id', protect, updateReview);

// DELETE /api/reviews/:id - Eliminar reseña propia
router.delete('/:id', protect, deleteReview);

// ========================================
// RUTAS DE MODERACIÓN (Admin)
// ========================================

// GET /api/reviews/moderation/pending - Reseñas pendientes de moderación
router.get('/moderation/pending', protect, admin, getPendingReviews);

// PATCH /api/reviews/moderation/:id/approve - Aprobar reseña
router.patch('/moderation/:id/approve', protect, admin, approveReview);

// PATCH /api/reviews/moderation/:id/reject - Rechazar reseña
router.patch('/moderation/:id/reject', protect, admin, rejectReview);

// GET /api/reviews/moderation/stats - Estadísticas de moderación
router.get('/moderation/stats', protect, admin, getModerationStats);

// GET /api/reviews/moderation/:status - Reseñas por estado de moderación
router.get('/moderation/:status', protect, admin, getReviewsByModerationStatus);

export default router; 