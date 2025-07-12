import Product from '../../models/Product.js';

// UPDATE - Actualizar stock de producto
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'add' } = req.body; // operation: 'add', 'subtract', 'set'

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    let newStock;
    switch (operation) {
      case 'add':
        newStock = product.stock + quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, product.stock - quantity);
        break;
      case 'set':
        newStock = Math.max(0, quantity);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Operación inválida. Use: add, subtract, o set'
        });
    }

    product.stock = newStock;
    await product.save();

    res.json({
      success: true,
      message: `Stock actualizado exitosamente`,
      data: {
        productId: product._id,
        oldStock: product.stock - (operation === 'add' ? quantity : operation === 'subtract' ? -quantity : 0),
        newStock: product.stock,
        operation
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar stock',
      error: error.message
    });
  }
};

// READ - Obtener productos con stock bajo
export const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10, page = 1, limit = 10 } = req.query;

    const query = {
      stock: { $lte: parseInt(threshold) }
    };

    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ stock: 1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        productsPerPage: parseInt(limit),
        threshold: parseInt(threshold)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos con stock bajo',
      error: error.message
    });
  }
};

// READ - Obtener productos sin stock
export const getOutOfStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = {
      stock: 0
    };

    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        productsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos sin stock',
      error: error.message
    });
  }
};

// UPDATE - Verificar disponibilidad de producto
export const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const isAvailable = product.isAvailable(parseInt(quantity));

    res.json({
      success: true,
      data: {
        productId: product._id,
        productName: product.name,
        currentStock: product.stock,
        requestedQuantity: parseInt(quantity),
        isAvailable,
        availableQuantity: Math.min(product.stock, parseInt(quantity))
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