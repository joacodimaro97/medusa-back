import Review from '../../models/Review.js';
import Product from '../../models/Product.js';

// @desc    Obtener reseñas pendientes de moderación
// @route   GET /api/reviews/moderation/pending
// @access  Private (Admin)
export const getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Solo admins pueden ver reseñas pendientes
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver reseñas pendientes' });
    }

    const filter = { status: 'pending' };
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
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas pendientes:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Aprobar una reseña
// @route   PATCH /api/reviews/moderation/:id/approve
// @access  Private (Admin)
export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Solo admins pueden aprobar reseñas
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para aprobar reseñas' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    review.status = 'approved';
    await review.save();
    await review.populate('productId userId');

    // Actualizar rating promedio del producto
    await updateProductRating(review.productId);

    res.json({
      success: true,
      data: review,
      message: 'Reseña aprobada exitosamente'
    });

  } catch (error) {
    console.error('Error aprobando reseña:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Rechazar una reseña
// @route   PATCH /api/reviews/moderation/:id/reject
// @access  Private (Admin)
export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Solo admins pueden rechazar reseñas
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para rechazar reseñas' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    review.status = 'rejected';
    review.moderationReason = reason;
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();

    await review.save();
    await review.populate('productId userId');

    // Actualizar rating promedio del producto
    await updateProductRating(review.productId);

    res.json({
      success: true,
      data: review,
      message: 'Reseña rechazada exitosamente'
    });

  } catch (error) {
    console.error('Error rechazando reseña:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener estadísticas de moderación
// @route   GET /api/reviews/moderation/stats
// @access  Private (Admin)
export const getModerationStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Solo admins pueden ver estadísticas de moderación
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver estadísticas de moderación' });
    }

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Estadísticas por estado
    const statusStats = await Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Reseñas moderadas por admin
    const moderationByAdmin = await Review.aggregate([
      { 
        $match: { 
          ...filter,
          moderatedBy: { $exists: true, $ne: null } 
        } 
      },
      {
        $group: {
          _id: '$moderatedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'admin'
        }
      },
      { $unwind: '$admin' },
      {
        $project: {
          adminId: '$_id',
          adminName: '$admin.name',
          adminEmail: '$admin.email',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Reseñas por día (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyReviews = await Review.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        statusStats,
        moderationByAdmin,
        dailyReviews
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de moderación:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener reseñas por estado de moderación
// @route   GET /api/reviews/moderation/:status
// @access  Private (Admin)
export const getReviewsByModerationStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Solo admins pueden ver reseñas por estado
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver esta información' });
    }

    // Validar estado
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Estado de moderación inválido' });
    }

    const filter = { status };
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'productId', select: 'name image price' },
        { path: 'userId', select: 'name email' },
        { path: 'moderatedBy', select: 'name email' }
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
      status: status
    });

  } catch (error) {
    console.error('Error obteniendo reseñas por estado de moderación:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Función auxiliar para actualizar el rating promedio de un producto
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ 
      productId, 
      status: 'approved' 
    });
    
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
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Error actualizando rating del producto:', error);
  }
}; 