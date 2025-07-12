import User from '../../models/User.js';

// READ - Obtener todos los usuarios (solo admin)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('favorites', 'name price image category')
      .populate('orders', 'total paymentStatus createdAt')
      .populate('reviews', 'rating comment createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        usersPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// READ - Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-password')
      .populate('favorites', 'name price image category description')
      .populate('orders', 'total paymentStatus shippingStatus createdAt')
      .populate('reviews', 'rating comment createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// UPDATE - Actualizar usuario por ID (solo admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, isAdmin } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el email ya existe en otro usuario
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado por otro usuario'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, phone, address, isAdmin },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// DELETE - Eliminar usuario por ID (solo admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar el propio usuario si es admin
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
}; 