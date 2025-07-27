import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configurar dotenv
dotenv.config();

// Obtener __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar configuración de base de datos
import connectDB from './config/database.js';

// Importar modelos para que se registren en Mongoose
import './models/User.js';
import './models/Product.js';
import './models/Category.js';
import './models/Cart.js';
import './models/Order.js';
import './models/Review.js';

// Importar rutas
import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import reviewsRouter from './routes/reviews.js';

const app = express();

// Conectar a MongoDB
connectDB();

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', process.env.CORS_ORIGIN].filter(Boolean),
  credentials: true
}));

// Middleware de logging y parsing
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);
app.use('/reviews', reviewsRouter);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  const { status = 500, message = 'Error interno del servidor' } = err;
  
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

export default app;
