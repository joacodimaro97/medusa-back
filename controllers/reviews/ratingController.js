import Review from '../../models/Review.js';
import Product from '../../models/Product.js';

// @desc    Obtener estadísticas de ratings por producto
// @route   GET /api/reviews/ratings/product/:productId
// @access  Public
export const getProductRatingStats = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Obtener estadísticas de ratings
    const ratingStats = await Review.aggregate([
      { $match: { productId: product._id } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Calcular totales
    const totalReviews = await Review.countDocuments({ productId });
    const averageRating = await Review.aggregate([
      { $match: { productId: product._id } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' }
        }
      }
    ]);

    // Crear objeto con conteo por rating (1-5)
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = 0;
    }

    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        productId,
        productName: product.name,
        totalReviews,
        averageRating: averageRating[0]?.average || 0,
        ratingDistribution,
        ratingStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de ratings:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener productos mejor calificados
// @route   GET /api/reviews/ratings/top-products
// @access  Public
export const getTopRatedProducts = async (req, res) => {
  try {
    const { limit = 10, minReviews = 1 } = req.query;

    const topProducts = await Product.aggregate([
      {
        $match: {
          averageRating: { $gt: 0 },
          reviewCount: { $gte: parseInt(minReviews) }
        }
      },
      {
        $project: {
          name: 1,
          image: 1,
          price: 1,
          averageRating: 1,
          reviewCount: 1,
          categoryId: 1
        }
      },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: topProducts
    });

  } catch (error) {
    console.error('Error obteniendo productos mejor calificados:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener reseñas por rating específico
// @route   GET /api/reviews/ratings/:rating
// @access  Public
export const getReviewsByRating = async (req, res) => {
  try {
    const { rating } = req.params;
    const { page = 1, limit = 10, productId } = req.query;

    // Validar rating
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating debe estar entre 1 y 5' });
    }

    const filter = { rating: ratingNum };
    if (productId) filter.productId = productId;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'productId', select: 'name image price' },
        { path: 'userId', select: 'name email' }
      ],
      sort: { createdAt: -1 }
    };

    const reviews = await Review.paginate(filter, options);

    res.json({
      success: true,
      data: reviews.docs,
      pagination: {
        page: reviews.page,
        totalPages: reviews.totalPages,
        totalDocs: reviews.totalDocs,
        hasNextPage: reviews.hasNextPage,
        hasPrevPage: reviews.hasPrevPage
      },
      rating: ratingNum
    });

  } catch (error) {
    console.error('Error obteniendo reseñas por rating:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener estadísticas generales de ratings
// @route   GET /api/reviews/ratings/stats
// @access  Public
export const getRatingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Estadísticas generales
    const generalStats = await Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          minRating: { $min: '$rating' },
          maxRating: { $max: '$rating' }
        }
      }
    ]);

    // Distribución por rating
    const ratingDistribution = await Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Productos con más reseñas
    const topReviewedProducts = await Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$productId',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          productImage: '$product.image',
          reviewCount: 1,
          averageRating: 1
        }
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        general: generalStats[0] || {
          totalReviews: 0,
          averageRating: 0,
          minRating: 0,
          maxRating: 0
        },
        ratingDistribution,
        topReviewedProducts
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de ratings:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}; 