import Review from '../../models/Review.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';

// @desc    Crear una nueva reseña
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar que el usuario no haya hecho ya una reseña para este producto
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ 
        message: 'Ya has hecho una reseña para este producto' 
      });
    }

    // Crear la reseña
    const review = new Review({
      productId,
      userId,
      rating,
      comment
    });

    await review.save();
    await review.populate('userId', 'name email');
    await review.populate('productId', 'name image');

    // Actualizar rating promedio del producto
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      data: review,
      message: 'Reseña creada exitosamente'
    });

  } catch (error) {
    console.error('Error creando reseña:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener todas las reseñas (con filtros)
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      productId, 
      userId, 
      rating,
      sort = 'createdAt' 
    } = req.query;

    const filter = {};

    // Filtros
    if (productId) filter.productId = productId;
    if (userId) filter.userId = userId;
    if (rating) filter.rating = parseInt(rating);

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'productId', select: 'name image price' },
        { path: 'userId', select: 'name email' }
      ],
      sort: { [sort]: -1 }
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
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener una reseña por ID
// @route   GET /api/reviews/:id
// @access  Public
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('productId', 'name image price description')
      .populate('userId', 'name email');

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Error obteniendo reseña:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Actualizar una reseña
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Verificar que el usuario sea el dueño de la reseña o sea admin
    if (review.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permisos para actualizar esta reseña' 
      });
    }

    // Actualizar campos
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    await review.populate('productId userId');

    // Actualizar rating promedio del producto
    await updateProductRating(review.productId);

    res.json({
      success: true,
      data: review,
      message: 'Reseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando reseña:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Eliminar una reseña
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Verificar que el usuario sea el dueño de la reseña o sea admin
    if (review.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permisos para eliminar esta reseña' 
      });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(id);

    // Actualizar rating promedio del producto
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando reseña:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener reseñas de un producto específico
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sort = 'createdAt' } = req.query;

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const filter = { productId };
    if (rating) filter.rating = parseInt(rating);

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'userId', select: 'name email' }
      ],
      sort: { [sort]: -1 }
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
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas del producto:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Función auxiliar para actualizar el rating promedio de un producto
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ productId });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, { 
        averageRating: 0, 
        reviewCount: 0 
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Error actualizando rating del producto:', error);
  }
}; 