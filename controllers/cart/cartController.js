import Cart from '../../models/Cart.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';

// CREATE - Crear nuevo carrito
export const createCart = async (req, res) => {
  try {
    const { userId, visitorId } = req.body;

    // Verificar que al menos uno de los dos esté presente
    if (!userId && !visitorId) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar userId o visitorId'
      });
    }

    // Si se proporciona userId, verificar que el usuario existe
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si ya existe un carrito para este usuario
      const existingCart = await Cart.findOne({ userId });
      if (existingCart) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya tiene un carrito activo',
          data: existingCart
        });
      }
    }

    // Si se proporciona visitorId, verificar que no exista ya
    if (visitorId) {
      const existingCart = await Cart.findOne({ visitorId });
      if (existingCart) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un carrito para este visitante',
          data: existingCart
        });
      }
    }

    const cart = new Cart({
      userId,
      visitorId,
      items: []
    });

    await cart.save();

    // Populate items para la respuesta
    await cart.populate('items.productId', 'name price images stock');

    res.status(201).json({
      success: true,
      message: 'Carrito creado exitosamente',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear carrito',
      error: error.message
    });
  }
};

// READ - Obtener carrito por usuario o visitante
export const getCart = async (req, res) => {
  try {
    const { userId, visitorId } = req.query;

    if (!userId && !visitorId) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar userId o visitorId'
      });
    }

    const query = {};
    if (userId) query.userId = userId;
    if (visitorId) query.visitorId = visitorId;

    const cart = await Cart.findOne(query)
      .populate('items.productId', 'name price images stock discount isFeatured')
      .populate('userId', 'name email');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener carrito',
      error: error.message
    });
  }
};

// READ - Obtener carrito del usuario autenticado
export const getMyCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price images stock discount isFeatured')
      .populate('userId', 'name email');

    if (!cart) {
      // Crear carrito automáticamente si no existe
      const newCart = new Cart({
        userId,
        items: []
      });
      await newCart.save();
      
      return res.json({
        success: true,
        message: 'Carrito creado automáticamente',
        data: newCart
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener carrito',
      error: error.message
    });
  }
};

// UPDATE - Actualizar carrito (convertir visitante a usuario)
export const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, visitorId } = req.body;

    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Si se está asignando un userId, verificar que el usuario existe
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar que no haya otro carrito para este usuario
      const existingCart = await Cart.findOne({ userId, _id: { $ne: id } });
      if (existingCart) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya tiene otro carrito activo'
        });
      }
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      id,
      { userId, visitorId },
      { new: true, runValidators: true }
    ).populate('items.productId', 'name price images stock');

    res.json({
      success: true,
      message: 'Carrito actualizado exitosamente',
      data: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar carrito',
      error: error.message
    });
  }
};

// DELETE - Eliminar carrito
export const deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    await Cart.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Carrito eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar carrito',
      error: error.message
    });
  }
};

// READ - Obtener todos los carritos (solo admin)
export const getAllCarts = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, visitorId, hasItems } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (visitorId) query.visitorId = visitorId;
    if (hasItems === 'true') query.items = { $ne: [] };
    if (hasItems === 'false') query.items = { $size: 0 };

    const carts = await Cart.find(query)
      .populate('items.productId', 'name price')
      .populate('userId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const total = await Cart.countDocuments(query);

    res.json({
      success: true,
      data: carts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCarts: total,
        cartsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener carritos',
      error: error.message
    });
  }
}; 