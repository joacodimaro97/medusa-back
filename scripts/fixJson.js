import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el JSON original
const productsPath = path.join(__dirname, '..', 'productos_tecnologia_realistas.json');
const originalProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`📦 Productos originales: ${originalProducts.length}`);

// Crear un Map para agrupar productos por nombre
const productsByName = new Map();

originalProducts.forEach(product => {
  const name = product.name;
  if (!productsByName.has(name)) {
    productsByName.set(name, []);
  }
  productsByName.get(name).push(product);
});

console.log(`🏷️ Productos únicos encontrados: ${productsByName.size}`);

// Mostrar duplicados
console.log('\n📋 Productos con duplicados:');
productsByName.forEach((products, name) => {
  if (products.length > 1) {
    console.log(`- ${name}: ${products.length} variantes`);
  }
});

// Crear lista de productos únicos (tomando la primera variante de cada nombre)
const uniqueProducts = [];
productsByName.forEach((products, name) => {
  // Tomar el primer producto de cada nombre
  uniqueProducts.push(products[0]);
});

console.log(`\n✅ Productos únicos después de limpieza: ${uniqueProducts.length}`);

// Si tenemos menos de 100 productos únicos, necesitamos crear más
if (uniqueProducts.length < 100) {
  console.log(`⚠️ Necesitamos crear ${100 - uniqueProducts.length} productos más`);
  
  // Crear productos adicionales basados en los existentes
  const additionalProducts = [];
  const baseProducts = [...uniqueProducts];
  
  for (let i = uniqueProducts.length; i < 100; i++) {
    const baseProduct = baseProducts[i % baseProducts.length];
    const newProduct = {
      ...baseProduct,
      name: `${baseProduct.name} - Variante ${Math.floor(i / baseProducts.length) + 1}`,
      price: Math.round((baseProduct.price * (0.8 + Math.random() * 0.4)) * 100) / 100,
      discount: Math.floor(Math.random() * 25),
      stock: Math.floor(Math.random() * 500) + 50
    };
    additionalProducts.push(newProduct);
  }
  
  uniqueProducts.push(...additionalProducts);
}

// Asegurar que tenemos exactamente 100 productos
const finalProducts = uniqueProducts.slice(0, 100);

console.log(`🎯 Productos finales: ${finalProducts.length}`);

// Guardar el JSON corregido
const outputPath = path.join(__dirname, '..', 'productos_tecnologia_limpios.json');
fs.writeFileSync(outputPath, JSON.stringify(finalProducts, null, 2));

console.log(`\n✅ JSON corregido guardado en: ${outputPath}`);

// Mostrar estadísticas por categoría
const statsByCategory = {};
finalProducts.forEach(product => {
  const category = product.category;
  if (!statsByCategory[category]) {
    statsByCategory[category] = 0;
  }
  statsByCategory[category]++;
});

console.log('\n📊 Distribución por categoría:');
Object.entries(statsByCategory).forEach(([category, count]) => {
  console.log(`- ${category}: ${count} productos`);
}); 