import Order from '../../models/Order.js';

// @desc    Obtener estadísticas generales de pedidos
// @route   GET /api/orders/stats/overview
// @access  Private (Admin)
export const getOrderOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Solo admins pueden ver estadísticas
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver estadísticas' });
    }

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Estadísticas generales
    const overview = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          minOrderValue: { $min: '$total' },
          maxOrderValue: { $max: '$total' }
        }
      }
    ]);

    // Conteo por estado de pago
    const paymentStatusCount = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Conteo por estado de envío
    const shippingStatusCount = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$shippingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Pedidos por día (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyOrders = await Order.aggregate([
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
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: overview[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          minOrderValue: 0,
          maxOrderValue: 0
        },
        paymentStatus: paymentStatusCount,
        shippingStatus: shippingStatusCount,
        dailyOrders
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener estadísticas por período
// @route   GET /api/orders/stats/period
// @access  Private (Admin)
export const getOrderStatsByPeriod = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    // Solo admins pueden ver estadísticas
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver estadísticas' });
    }

    let dateFormat = '%Y-%m';
    if (period === 'day') dateFormat = '%Y-%m-%d';
    else if (period === 'week') dateFormat = '%Y-%U';
    else if (period === 'year') dateFormat = '%Y';

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const periodStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        stats: periodStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas por período:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener productos más vendidos
// @route   GET /api/orders/stats/top-products
// @access  Private (Admin)
export const getTopProducts = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    // Solo admins pueden ver estadísticas
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver estadísticas' });
    }

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const topProducts = await Order.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
          orderCount: { $sum: 1 }
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
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: topProducts
    });

  } catch (error) {
    console.error('Error obteniendo productos más vendidos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener estadísticas de clientes
// @route   GET /api/orders/stats/customers
// @access  Private (Admin)
export const getCustomerStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Solo admins pueden ver estadísticas
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver estadísticas' });
    }

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Clientes más frecuentes
    const topCustomers = await Order.aggregate([
      { $match: { ...filter, userId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          customerName: '$user.name',
          customerEmail: '$user.email',
          orderCount: 1,
          totalSpent: 1,
          avgOrderValue: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // Estadísticas de guest vs usuarios registrados
    const customerTypeStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$userId', null] },
              'guest',
              'registered'
            ]
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        topCustomers,
        customerTypes: customerTypeStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de clientes:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}; 