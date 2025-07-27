import axios from 'axios';

// Ejemplo: categoría Celulares y Teléfonos en Argentina (MLA1051)
const categoryId = 'MLA1051';
const url = `https://api.mercadolibre.com/sites/MLA/search?category=${categoryId}&limit=10`;

async function obtenerProductos() {
  try {
    const respuesta = await axios.get(url);
    const productos = respuesta.data.results;

    // Mostrar productos relevantes
    productos.forEach((p, index) => {
      console.log(`📦 Producto ${index + 1}`);
      console.log(`Nombre: ${p.title}`);
      console.log(`Precio: $${p.price}`);
      console.log(`Stock: ${p.available_quantity}`);
      console.log(`Link: ${p.permalink}`);
      console.log(`Imagen: ${p.thumbnail}`);
      console.log('-------------------------------');
    });

    // Si querés guardarlo en JSON:
    // import fs from 'fs';
    // fs.writeFileSync('productos_ml.json', JSON.stringify(productos, null, 2), 'utf-8');

  } catch (error) {
    console.error('❌ Error al obtener productos:', error.message);
  }
}

obtenerProductos();
