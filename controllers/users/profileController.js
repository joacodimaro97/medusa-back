import User from '../../models/User.js';

// READ - Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('favorites', 'name price image category description')
      .populate('orders', 'total paymentStatus shippingStatus createdAt')
      .populate('reviews', 'rating comment createdAt');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// UPDATE - Actualizar perfil del usuario autenticado
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Verificar si el email ya existe en otro usuario
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado por otro usuario'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// UPDATE - Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Verificar contraseña actual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
}; 