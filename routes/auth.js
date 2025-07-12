import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Función para generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
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

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
});

// POST /auth/login - Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el login',
      error: error.message
    });
  }
});

// GET /auth/me - Obtener usuario autenticado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('favorites', 'name price image category')
      .populate('orders', 'total paymentStatus shippingStatus createdAt')
      .populate('reviews', 'rating comment createdAt');

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
});

// POST /auth/refresh - Renovar token (opcional)
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generar nuevo token
    const token = generateToken(req.user._id);

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al renovar token',
      error: error.message
    });
  }
});

export default router; 