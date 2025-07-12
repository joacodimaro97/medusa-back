import Category from '../../models/Category.js';
import Product from '../../models/Product.js';

// CREATE - Crear nueva categoría
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Verificar si la categoría ya existe
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const category = new Category({
      name,
      description
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

// READ - Obtener todas las categorías
export const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    // Construir query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Construir sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const categories = await Category.find(query)
      .populate('products', 'name price images stock')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCategories: total,
        categoriesPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// READ - Obtener categoría por ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id)
      .populate('products', 'name price images stock description discount isFeatured');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: error.message
    });
  }
};

// UPDATE - Actualizar categoría
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si el nuevo nombre ya existe en otra categoría
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    ).populate('products', 'name price images');

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: updatedCategory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  }
};

// DELETE - Eliminar categoría
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si hay productos en esta categoría
    const productsInCategory = await Product.countDocuments({ category: id });
    if (productsInCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la categoría. Tiene ${productsInCategory} productos asociados`
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: error.message
    });
  }
}; 