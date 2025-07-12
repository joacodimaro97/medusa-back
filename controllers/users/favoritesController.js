import User from '../../models/User.js';

// READ - Obtener favoritos del usuario
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('favorites')
      .populate('favorites', 'name price image category description');
    
    res.json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener favoritos',
      error: error.message
    });
  }
};

// CREATE - Agregar producto a favoritos
export const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    
    await user.addToFavorites(productId);
    
    const updatedUser = await User.findById(req.user._id)
      .select('-password')
      .populate('favorites', 'name price image category');
    
    res.json({
      success: true,
      message: 'Producto agregado a favoritos',
      data: updatedUser.favorites
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al agregar a favoritos',
      error: error.message
    });
  }
};

// DELETE - Remover producto de favoritos
export const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    
    await user.removeFromFavorites(productId);
    
    const updatedUser = await User.findById(req.user._id)
      .select('-password')
      .populate('favorites', 'name price image category');
    
    res.json({
      success: true,
      message: 'Producto removido de favoritos',
      data: updatedUser.favorites
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al remover de favoritos',
      error: error.message
    });
  }
}; 