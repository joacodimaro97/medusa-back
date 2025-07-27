import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv
dotenv.config();

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Función para crear categorías si no existen
const createCategories = async () => {
  const categories = [
    {
      _id: '66b3f0d35f68c23c4f0b9e0a',
      name: 'Smartphones',
      description: 'Teléfonos móviles y smartphones de última generación'
    },
    {
      _id: '66b3f0d35f68c23c4f0b9e0b',
      name: 'Laptops',
      description: 'Portátiles y laptops para trabajo y gaming'
    },
    {
      _id: '66b3f0d35f68c23c4f0b9e0c',
      name: 'Audio',
      description: 'Auriculares, altavoces y dispositivos de audio'
    },
    {
      _id: '66b3f0d35f68c23c4f0b9e0d',
      name: 'Periféricos',
      description: 'Teclados, ratones y otros periféricos de computadora'
    }
  ];

  for (const categoryData of categories) {
    try {
      // Verificar si la categoría ya existe
      const existingCategory = await Category.findById(categoryData._id);
      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        console.log(`✅ Categoría creada: ${category.name}`);
      } else {
        console.log(`ℹ️ Categoría ya existe: ${existingCategory.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creando categoría ${categoryData.name}:`, error.message);
    }
  }
};

// Función para insertar productos
const seedProducts = async () => {
  try {
    // Leer el archivo JSON (usando productos generados por API)
    const productsPath = path.join(__dirname, '..', 'productos_generados_api.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    console.log(`📦 Iniciando inserción de ${productsData.length} productos...`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const productData of productsData) {
      try {
        // Verificar si el producto ya existe (por nombre y categoría)
        const existingProduct = await Product.findOne({
          name: productData.name,
          category: productData.category
        });

        if (existingProduct) {
          console.log(`⏭️ Producto ya existe: ${productData.name}`);
          skippedCount++;
          continue;
        }

        // Crear el nuevo producto
        const product = new Product(productData);
        await product.save();

        // Agregar el producto a la categoría
        await Category.findByIdAndUpdate(
          productData.category,
          { $push: { products: product._id } }
        );

        console.log(`✅ Producto insertado: ${product.name}`);
        insertedCount++;

      } catch (error) {
        console.error(`❌ Error insertando producto ${productData.name}:`, error.message);
      }
    }

    console.log(`\n📊 Resumen de la inserción:`);
    console.log(`✅ Productos insertados: ${insertedCount}`);
    console.log(`⏭️ Productos omitidos: ${skippedCount}`);
    console.log(`📦 Total procesados: ${productsData.length}`);

  } catch (error) {
    console.error('❌ Error leyendo archivo JSON:', error.message);
  }
};

// Función principal
const main = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Crear categorías si no existen
    console.log('\n🏷️ Verificando categorías...');
    await createCategories();

    // Insertar productos
    console.log('\n📦 Insertando productos...');
    await seedProducts();

    console.log('\n🎉 ¡Proceso completado exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
    process.exit(1);
  }
};

// Ejecutar el script
main(); 