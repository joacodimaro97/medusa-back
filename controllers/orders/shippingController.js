import Order from '../../models/Order.js';

// @desc    Actualizar estado de envío de un pedido
// @route   PATCH /api/orders/:id/shipping
// @access  Private (Admin)
export const updateShippingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingStatus, trackingNumber } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Solo admins pueden actualizar estados de envío
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para actualizar estados de envío' });
    }

    // Validar estado de envío
    if (!['pending', 'shipped', 'delivered'].includes(shippingStatus)) {
      return res.status(400).json({ message: 'Estado de envío inválido' });
    }

    // Verificar que el pedido esté pagado antes de enviarlo
    if (shippingStatus === 'shipped' && order.paymentStatus !== 'paid') {
      return res.status(400).json({ 
        message: 'No se puede enviar un pedido que no esté pagado' 
      });
    }

    // Actualizar estado usando el método del modelo
    await order.updateShippingStatus(shippingStatus);
    
    // Agregar número de seguimiento si se proporciona
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
      await order.save();
    }

    await order.populate('items.productId userId');

    res.json({
      success: true,
      data: order,
      message: `Estado de envío actualizado a: ${shippingStatus}`
    });

  } catch (error) {
    console.error('Error actualizando estado de envío:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener pedidos por estado de envío
// @route   GET /api/orders/shipping/:status
// @access  Private (Admin)
export const getOrdersByShippingStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Solo admins pueden ver pedidos por estado de envío
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver esta información' });
    }

    // Validar estado de envío
    if (!['pending', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Estado de envío inválido' });
    }

    const filter = { shippingStatus: status };
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
    console.error('Error obteniendo pedidos por estado de envío:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener estadísticas de envíos
// @route   GET /api/orders/shipping/stats
// @access  Private (Admin)
export const getShippingStats = async (req, res) => {
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

    // Estadísticas por estado de envío
    const shippingStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$shippingStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    // Pedidos listos para enviar (pagados pero no enviados)
    const readyToShip = await Order.countDocuments({
      ...filter,
      paymentStatus: 'paid',
      shippingStatus: 'pending'
    });

    // Pedidos en tránsito
    const inTransit = await Order.countDocuments({
      ...filter,
      shippingStatus: 'shipped'
    });

    // Pedidos entregados
    const delivered = await Order.countDocuments({
      ...filter,
      shippingStatus: 'delivered'
    });

    res.json({
      success: true,
      data: {
        shippingStatus: shippingStats,
        summary: {
          readyToShip,
          inTransit,
          delivered
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de envíos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener pedidos listos para enviar
// @route   GET /api/orders/shipping/ready
// @access  Private (Admin)
export const getReadyToShipOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Solo admins pueden ver pedidos listos para enviar
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver esta información' });
    }

    const filter = {
      paymentStatus: 'paid',
      shippingStatus: 'pending'
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'items.productId', select: 'name price image' },
        { path: 'userId', select: 'name email' }
      ],
      sort: { createdAt: 1 } // Más antiguos primero
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
      }
    });

  } catch (error) {
    console.error('Error obteniendo pedidos listos para enviar:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}; 