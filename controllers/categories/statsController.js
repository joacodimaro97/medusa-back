import Category from '../../models/Category.js';
import Product from '../../models/Product.js';

// READ - Obtener estadísticas de categorías
export const getCategoryStats = async (req, res) => {
  try {
    const stats = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          productCount: { $size: '$products' },
          totalValue: {
            $sum: {
              $map: {
                input: '$products',
                as: 'product',
                in: { $multiply: ['$$product.price', { $subtract: [1, { $divide: ['$$product.discount', 100] }] }] }
              }
            }
          },
          averagePrice: {
            $cond: {
              if: { $gt: [{ $size: '$products' }, 0] },
              then: { $avg: '$products.price' },
              else: 0
            }
          },
          lowStockProducts: {
            $size: {
              $filter: {
                input: '$products',
                as: 'product',
                cond: { $lte: ['$$product.stock', 10] }
              }
            }
          },
          outOfStockProducts: {
            $size: {
              $filter: {
                input: '$products',
                as: 'product',
                cond: { $eq: ['$$product.stock', 0] }
              }
            }
          }
        }
      },
      {
        $sort: { productCount: -1 }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de categorías',
      error: error.message
    });
  }
};

// READ - Obtener categorías con más productos
export const getTopCategories = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topCategories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          productCount: { $size: '$products' },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$products',
                as: 'product',
                in: { $multiply: ['$$product.price', { $subtract: [1, { $divide: ['$$product.discount', 100] }] }] }
              }
            }
          }
        }
      },
      {
        $match: { productCount: { $gt: 0 } }
      },
      {
        $sort: { productCount: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: topCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías principales',
      error: error.message
    });
  }
};

// READ - Obtener categorías vacías
export const getEmptyCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const emptyCategories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $match: { products: { $size: 0 } }
      },
      {
        $project: {
          name: 1,
          description: 1,
          productCount: { $size: '$products' },
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit)
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const total = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $match: { products: { $size: 0 } }
      },
      {
        $count: 'total'
      }
    ]);

    res.json({
      success: true,
      data: emptyCategories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        totalCategories: total[0]?.total || 0,
        categoriesPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías vacías',
      error: error.message
    });
  }
}; 