import Order from '../../models/Order.js';
import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';

// @desc    Crear un nuevo pedido
// @route   POST /api/orders
// @access  Public (para guest checkout) / Private (para usuarios)
export const createOrder = async (req, res) => {
  try {
    const { 
      email, 
      shippingAddress, 
      paymentProvider = 'stripe',
      cartId = null,
      items = null 
    } = req.body;

    let orderItems = [];
    let total = 0;

    // Si se proporciona cartId, obtener items del carrito
    if (cartId) {
      const cart = await Cart.findById(cartId).populate('items.productId');
      if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
      }

      orderItems = cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        priceAtPurchase: item.productId.price
      }));

      total = cart.total;
    } 
    // Si se proporcionan items directamente
    else if (items && items.length > 0) {
      // Verificar que todos los productos existan y tengan stock
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ 
            message: `Producto con ID ${item.productId} no encontrado` 
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Stock insuficiente para el producto ${product.name}` 
          });
        }
      }

      orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase
      }));

      total = items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
    } else {
      return res.status(400).json({ message: 'Se requiere cartId o items' });
    }

    // Crear el pedido
    const orderData = {
      email,
      shippingAddress,
      items: orderItems,
      total,
      paymentProvider,
      userId: req.user?.id || null
    };

    const order = new Order(orderData);
    await order.save();

    // Actualizar stock de productos
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Si se usó un carrito, limpiarlo
    if (cartId) {
      await Cart.findByIdAndUpdate(cartId, { items: [], total: 0 });
    }

    await order.populate('items.productId');
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Pedido creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener todos los pedidos (con filtros)
// @route   GET /api/orders
// @access  Private (Admin) / Private (usuario ve solo sus pedidos)
export const getOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      email,
      startDate,
      endDate 
    } = req.query;

    const filter = {};

    // Si es usuario normal, solo ver sus pedidos
    if (req.user && req.user.role !== 'admin') {
      filter.userId = req.user.id;
    }

    // Filtros adicionales
    if (status) {
      if (status === 'paid') filter.paymentStatus = 'paid';
      else if (status === 'pending') filter.paymentStatus = 'pending';
      else if (status === 'shipped') filter.shippingStatus = 'shipped';
      else if (status === 'delivered') filter.shippingStatus = 'delivered';
    }

    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

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
      }
    });

  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Obtener un pedido por ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('items.productId', 'name price image description')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar que el usuario pueda ver este pedido
    if (req.user.role !== 'admin' && order.userId?._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para ver este pedido' });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Actualizar un pedido
// @route   PUT /api/orders/:id
// @access  Private (Admin)
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      shippingAddress, 
      paymentStatus, 
      shippingStatus,
      items 
    } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Solo admins pueden actualizar pedidos
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para actualizar pedidos' });
    }

    // Actualizar campos permitidos
    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (shippingStatus) order.shippingStatus = shippingStatus;
    if (items) {
      // Recalcular total si cambian los items
      order.items = items;
      order.total = items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
    }

    await order.save();
    await order.populate('items.productId userId');

    res.json({
      success: true,
      data: order,
      message: 'Pedido actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando pedido:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// @desc    Eliminar un pedido
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Solo admins pueden eliminar pedidos
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para eliminar pedidos' });
    }

    // Restaurar stock de productos
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    await Order.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Pedido eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando pedido:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}; 