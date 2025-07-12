import Order from '../../models/Order.js';

// @desc    Actualizar estado de pago de un pedido
// @route   PATCH /api/orders/:id/payment
// @access  Private (Admin)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentProvider } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Solo admins pueden actualizar estados de pago
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para actualizar estados de pago' });
    }

    // Validar estado de pago
    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Estado de pago inválido' });
    }

    // Actualizar estado usando el método del modelo
    await order.updatePaymentStatus(paymentStatus);
    
    // Actualizar proveedor de pago si se proporciona
    if (paymentProvider) {
      order.paymentProvider = paymentProvider;
      await order.save();
    }

    await order.populate('items.productId userId');

    res.json({
      success: true,
      data: order,
      message: `Estado de pago actualizado a: ${paymentStatus}`
    });

  } catch (error) {
    console.error('Error actualizando estado de pago:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener pedidos por estado de pago
// @route   GET /api/orders/payment/:status
// @access  Private (Admin)
export const getOrdersByPaymentStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Solo admins pueden ver pedidos por estado de pago
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver esta información' });
    }

    // Validar estado de pago
    if (!['pending', 'paid', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Estado de pago inválido' });
    }

    const filter = { paymentStatus: status };
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'items.productId', select: 'name price image' },
        { path: 'userId', select: 'name email' }
      ],
      sort: { createdAt: -1 }
    };

    const orders = await Order.paginate(filter, options);

    res.json({
      success: true,
      data: orders.docs,
      pagination: {
        page: orders.page,
        totalPages: orders.totalPages,
        totalDocs: orders.totalDocs,
        hasNextPage: orders.hasNextPage,
        hasPrevPage: orders.hasPrevPage
      },
      status: status
    });

  } catch (error) {
    console.error('Error obteniendo pedidos por estado de pago:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener estadísticas de pagos
// @route   GET /api/orders/payment/stats
// @access  Private (Admin)
export const getPaymentStats = async (req, res) => {
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

    // Estadísticas por estado de pago
    const paymentStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    // Estadísticas por proveedor de pago
    const providerStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentProvider',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    // Total general
    const totalStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        paymentStatus: paymentStats,
        paymentProviders: providerStats,
        totals: totalStats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de pagos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}; 