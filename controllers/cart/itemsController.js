import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';

// ADD - Agregar producto al carrito
export const addItemToCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { productId, quantity = 1 } = req.body;

    // Verificar que el producto existe y tiene stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${product.stock}`
      });
    }

    // Obtener el carrito
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Agregar item usando el método del modelo
    await cart.addItem(productId, quantity);

    // Populate para la respuesta
    await cart.populate('items.productId', 'name price images stock discount');

    res.json({
      success: true,
      message: 'Producto agregado al carrito',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al agregar producto al carrito',
      error: error.message
    });
  }
};

// ADD - Agregar producto al carrito del usuario autenticado
export const addItemToMyCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    // Verificar que el producto existe y tiene stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${product.stock}`
      });
    }

    // Obtener o crear carrito del usuario
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // Agregar item
    await cart.addItem(productId, quantity);

    // Populate para la respuesta
    await cart.populate('items.productId', 'name price images stock discount');

    res.json({
      success: true,
      message: 'Producto agregado al carrito',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al agregar producto al carrito',
      error: error.message
    });
  }
};

// UPDATE - Actualizar cantidad de un producto
export const updateItemQuantity = async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad no puede ser negativa'
      });
    }

    // Verificar stock si la cantidad es mayor a 0
    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Disponible: ${product.stock}`
        });
      }
    }

    // Obtener el carrito
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Actualizar cantidad usando el método del modelo
    await cart.updateQuantity(productId, quantity);

    // Populate para la respuesta
    await cart.populate('items.productId', 'name price images stock discount');

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar cantidad',
      error: error.message
    });
  }
};

// UPDATE - Actualizar cantidad en carrito del usuario autenticado
export const updateItemQuantityInMyCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad no puede ser negativa'
      });
    }

    // Verificar stock si la cantidad es mayor a 0
    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Disponible: ${product.stock}`
        });
      }
    }

    // Obtener el carrito del usuario
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Actualizar cantidad
    await cart.updateQuantity(productId, quantity);

    // Populate para la respuesta
    await cart.populate('items.productId', 'name price images stock discount');

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar cantidad',
      error: error.message
    });
  }
};

// DELETE - Remover producto del carrito
export const removeItemFromCart = async (req, res) => {
  try {
    const { cartId, productId } = req.params;

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Remover item usando el método del modelo
    await cart.removeItem(productId);

    // Populate para la respuesta
    await cart.populate('items.productId', 'name price images stock discount');

    res.json({
      success: true,
      message: 'Producto removido del carrito',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al remover producto del carrito',
      error: error.message
    });
  }
};

// DELETE - Remover producto del carrito del usuario autenticado
export const removeItemFromMyCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Remover item
    await cart.removeItem(productId);

    // Populate para la respuesta
    await cart.populate('items.productId', 'name price images stock discount');

    res.json({
      success: true,
      message: 'Producto removido del carrito',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al remover producto del carrito',
      error: error.message
    });
  }
};

// DELETE - Limpiar carrito
export const clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Limpiar carrito usando el método del modelo
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Carrito limpiado exitosamente',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al limpiar carrito',
      error: error.message
    });
  }
};

// DELETE - Limpiar carrito del usuario autenticado
export const clearMyCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Limpiar carrito
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Carrito limpiado exitosamente',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al limpiar carrito',
      error: error.message
    });
  }
}; 