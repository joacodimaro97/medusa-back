import Product from '../../models/Product.js';
import Category from '../../models/Category.js';

// CREATE - Crear nuevo producto
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, discount, stock, category, images, isFeatured } = req.body;

    // Verificar si la categoría existe
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'La categoría especificada no existe'
      });
    }

    // Crear nuevo producto
    const product = new Product({
      name,
      description,
      price,
      discount: discount || 0,
      stock,
      category,
      images: images || [],
      isFeatured: isFeatured || false
    });

    await product.save();

    // Agregar producto a la categoría
    await categoryExists.addProduct(product._id);

    // Populate category para la respuesta
    await product.populate('category', 'name description');

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

// READ - Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search = '', 
      category = '', 
      minPrice = '', 
      maxPrice = '', 
      inStock = '', 
      isFeatured = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construir query
    const query = {};
    
    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }

    // Filtro por categoría
    if (category) {
      query.category = category;
    }

    // Filtro por precio
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filtro por stock
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = 0;
    }

    // Filtro por destacados
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Construir sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name description')
      .populate('reviews', 'rating comment')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

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
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// READ - Obtener producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('category', 'name description')
      .populate({
        path: 'reviews',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

// UPDATE - Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, discount, stock, category, images, isFeatured } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Si se cambia la categoría, verificar que existe
    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'La categoría especificada no existe'
        });
      }

      // Remover producto de la categoría anterior
      const oldCategory = await Category.findById(product.category);
      if (oldCategory) {
        await oldCategory.removeProduct(product._id);
      }

      // Agregar producto a la nueva categoría
      await categoryExists.addProduct(product._id);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, discount, stock, category, images, isFeatured },
      { new: true, runValidators: true }
    ).populate('category', 'name description');

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// DELETE - Eliminar producto
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Remover producto de la categoría
    const category = await Category.findById(product.category);
    if (category) {
      await category.removeProduct(product._id);
    }

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
}; 