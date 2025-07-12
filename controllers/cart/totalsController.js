import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';

// READ - Calcular totales del carrito
export const calculateCartTotals = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findById(cartId)
      .populate('items.productId', 'name price discount stock');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    const totals = calculateTotals(cart.items);

    res.json({
      success: true,
      data: {
        cartId: cart._id,
        items: cart.items,
        totals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al calcular totales',
      error: error.message
    });
  }
};

// READ - Calcular totales del carrito del usuario autenticado
export const calculateMyCartTotals = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price discount stock');

    if (!cart) {
      return res.json({
        success: true,
        data: {
          cartId: null,
          items: [],
          totals: {
            subtotal: 0,
            totalDiscount: 0,
            total: 0,
            itemCount: 0
          }
        }
      });
    }

    const totals = calculateTotals(cart.items);

    res.json({
      success: true,
      data: {
        cartId: cart._id,
        items: cart.items,
        totals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al calcular totales',
      error: error.message
    });
  }
};

// READ - Obtener resumen del carrito
export const getCartSummary = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findById(cartId)
      .populate('items.productId', 'name price discount stock images');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    const totals = calculateTotals(cart.items);
    const summary = {
      cartId: cart._id,
      itemCount: totals.itemCount,
      uniqueItems: cart.items.length,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      total: totals.total,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        discount: item.productId.discount,
        finalPrice: item.productId.finalPrice,
        quantity: item.quantity,
        subtotal: item.productId.finalPrice * item.quantity,
        image: item.productId.images[0] || null,
        stock: item.productId.stock
      }))
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen del carrito',
      error: error.message
    });
  }
};

// READ - Obtener resumen del carrito del usuario autenticado
export const getMyCartSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price discount stock images');

    if (!cart) {
      return res.json({
        success: true,
        data: {
          cartId: null,
          itemCount: 0,
          uniqueItems: 0,
          subtotal: 0,
          totalDiscount: 0,
          total: 0,
          items: []
        }
      });
    }

    const totals = calculateTotals(cart.items);
    const summary = {
      cartId: cart._id,
      itemCount: totals.itemCount,
      uniqueItems: cart.items.length,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      total: totals.total,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        discount: item.productId.discount,
        finalPrice: item.productId.finalPrice,
        quantity: item.quantity,
        subtotal: item.productId.finalPrice * item.quantity,
        image: item.productId.images[0] || null,
        stock: item.productId.stock
      }))
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen del carrito',
      error: error.message
    });
  }
};

// READ - Verificar disponibilidad de productos en carrito
export const checkCartAvailability = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findById(cartId)
      .populate('items.productId', 'name price stock');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    const availability = cart.items.map(item => {
      const isAvailable = item.productId.stock >= item.quantity;
      const availableQuantity = Math.min(item.productId.stock, item.quantity);
      
      return {
        productId: item.productId._id,
        productName: item.productId.name,
        requestedQuantity: item.quantity,
        availableStock: item.productId.stock,
        isAvailable,
        availableQuantity,
        needsAdjustment: !isAvailable
      };
    });

    const hasUnavailableItems = availability.some(item => !item.isAvailable);
    const totalUnavailable = availability.filter(item => !item.isAvailable).length;

    res.json({
      success: true,
      data: {
        cartId: cart._id,
        availability,
        hasUnavailableItems,
        totalUnavailable,
        totalItems: cart.items.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar disponibilidad',
      error: error.message
    });
  }
};

// READ - Verificar disponibilidad del carrito del usuario autenticado
export const checkMyCartAvailability = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price stock');

    if (!cart) {
      return res.json({
        success: true,
        data: {
          cartId: null,
          availability: [],
          hasUnavailableItems: false,
          totalUnavailable: 0,
          totalItems: 0
        }
      });
    }

    const availability = cart.items.map(item => {
      const isAvailable = item.productId.stock >= item.quantity;
      const availableQuantity = Math.min(item.productId.stock, item.quantity);
      
      return {
        productId: item.productId._id,
        productName: item.productId.name,
        requestedQuantity: item.quantity,
        availableStock: item.productId.stock,
        isAvailable,
        availableQuantity,
        needsAdjustment: !isAvailable
      };
    });

    const hasUnavailableItems = availability.some(item => !item.isAvailable);
    const totalUnavailable = availability.filter(item => !item.isAvailable).length;

    res.json({
      success: true,
      data: {
        cartId: cart._id,
        availability,
        hasUnavailableItems,
        totalUnavailable,
        totalItems: cart.items.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar disponibilidad',
      error: error.message
    });
  }
};

// Función auxiliar para calcular totales
const calculateTotals = (items) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let itemCount = 0;

  items.forEach(item => {
    const product = item.productId;
    const finalPrice = product.finalPrice || product.price;
    const itemSubtotal = finalPrice * item.quantity;
    const itemDiscount = (product.price - finalPrice) * item.quantity;

    subtotal += itemSubtotal;
    totalDiscount += itemDiscount;
    itemCount += item.quantity;
  });

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
    itemCount
  };
}; 