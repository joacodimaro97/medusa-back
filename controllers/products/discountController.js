import Product from '../../models/Product.js';

// UPDATE - Aplicar descuento a producto
export const applyDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountPercentage } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await product.applyDiscount(discountPercentage);

    res.json({
      success: true,
      message: `Descuento del ${discountPercentage}% aplicado exitosamente`,
      data: {
        productId: product._id,
        productName: product.name,
        originalPrice: product.price,
        discountPercentage: product.discount,
        finalPrice: product.finalPrice
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al aplicar descuento',
      error: error.message
    });
  }
};

// UPDATE - Remover descuento de producto
export const removeDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product.discount = 0;
    await product.save();

    res.json({
      success: true,
      message: 'Descuento removido exitosamente',
      data: {
        productId: product._id,
        productName: product.name,
        originalPrice: product.price,
        finalPrice: product.finalPrice
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al remover descuento',
      error: error.message
    });
  }
};

// READ - Obtener productos con descuento
export const getDiscountedProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, minDiscount = 0 } = req.query;

    const query = {
      discount: { $gt: parseInt(minDiscount) }
    };

    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ discount: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        productsPerPage: parseInt(limit),
        minDiscount: parseInt(minDiscount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos con descuento',
      error: error.message
    });
  }
};

// UPDATE - Aplicar descuento masivo por categoría
export const applyBulkDiscount = async (req, res) => {
  try {
    const { categoryId, discountPercentage } = req.body;

    if (!categoryId || !discountPercentage) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere categoryId y discountPercentage'
      });
    }

    const result = await Product.updateMany(
      { category: categoryId },
      { discount: discountPercentage }
    );

    res.json({
      success: true,
      message: `Descuento del ${discountPercentage}% aplicado a ${result.modifiedCount} productos`,
      data: {
        categoryId,
        discountPercentage,
        productsModified: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al aplicar descuento masivo',
      error: error.message
    });
  }
}; 