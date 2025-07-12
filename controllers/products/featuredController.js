import Product from '../../models/Product.js';

// UPDATE - Marcar producto como destacado
export const markAsFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product.isFeatured = true;
    await product.save();

    res.json({
      success: true,
      message: 'Producto marcado como destacado',
      data: {
        productId: product._id,
        productName: product.name,
        isFeatured: product.isFeatured
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al marcar producto como destacado',
      error: error.message
    });
  }
};

// UPDATE - Remover producto de destacados
export const removeFromFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product.isFeatured = false;
    await product.save();

    res.json({
      success: true,
      message: 'Producto removido de destacados',
      data: {
        productId: product._id,
        productName: product.name,
        isFeatured: product.isFeatured
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al remover producto de destacados',
      error: error.message
    });
  }
};

// READ - Obtener productos destacados
export const getFeaturedProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const query = {
      isFeatured: true
    };

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('reviews', 'rating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

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
      message: 'Error al obtener productos destacados',
      error: error.message
    });
  }
};

// UPDATE - Marcar múltiples productos como destacados
export const markMultipleAsFeatured = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de productIds'
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { isFeatured: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} productos marcados como destacados`,
      data: {
        productIds,
        productsModified: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al marcar productos como destacados',
      error: error.message
    });
  }
}; 