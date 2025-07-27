import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

// Importar modelos
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medusa_db');
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Función para limpiar la base de datos
const clearDatabase = async () => {
  try {
    console.log('🗑️ Iniciando limpieza de la base de datos...');

    // Eliminar todos los productos
    const deletedProducts = await Product.deleteMany({});
    console.log(`✅ Productos eliminados: ${deletedProducts.deletedCount}`);

    // Eliminar todas las categorías
    const deletedCategories = await Category.deleteMany({});
    console.log(`✅ Categorías eliminadas: ${deletedCategories.deletedCount}`);

    console.log('\n🎉 Base de datos limpiada exitosamente!');
    console.log('💡 Ahora puedes ejecutar el script de inserción de productos.');

  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error.message);
  }
};

// Función principal
const main = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Limpiar la base de datos
    await clearDatabase();

    process.exit(0);

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
    process.exit(1);
  }
};

// Ejecutar el script
main(); 