import User from '../../models/User.js';

// CREATE - Crear nuevo usuario
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password,
      phone,
      address
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
}; 