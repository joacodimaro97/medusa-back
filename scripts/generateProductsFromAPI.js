import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para generar URLs de imágenes realistas usando servicios confiables
const generateImageUrls = (productName, index) => {
  const imageServices = [
    // Picsum - imágenes aleatorias de alta calidad (muy confiable)
    `https://picsum.photos/400/400?random=${index}`,
    // Unsplash con términos específicos
    `https://source.unsplash.com/400x400/?${encodeURIComponent(productName.toLowerCase().split(' ').slice(0, 2).join(' '))}`,
    // Imágenes de productos específicos
    `https://images.unsplash.com/photo-${Math.floor(Math.random() * 999999999)}?w=400&h=400&fit=crop`,
    // Placeholder con colores aleatorios y texto personalizado
    `https://via.placeholder.com/400x400/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${encodeURIComponent(productName.split(' ').slice(0, 2).join('+'))}`
  ];
  
  // Seleccionar 1-3 imágenes aleatorias
  const numImages = Math.floor(Math.random() * 3) + 1;
  const selectedImages = [];
  
  for (let i = 0; i < numImages; i++) {
    const serviceIndex = Math.floor(Math.random() * imageServices.length);
    selectedImages.push(imageServices[serviceIndex]);
  }
  
  return selectedImages;
};

// Función para obtener productos de FakeStore API (más confiable)
const fetchProductsFromFakeStore = async () => {
  try {
    console.log('🔄 Obteniendo productos de FakeStore API...');
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();
    console.log(`✅ Obtenidos ${products.length} productos de FakeStore`);
    return products;
  } catch (error) {
    console.error('❌ Error obteniendo productos de FakeStore:', error.message);
    return [];
  }
};

// Función para obtener productos de DummyJSON API
const fetchProductsFromDummyJSON = async (limit = 100) => {
  try {
    console.log(`🔄 Obteniendo ${limit} productos de DummyJSON API...`);
    const response = await fetch(`https://dummyjson.com/products?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`✅ Obtenidos ${data.products.length} productos de DummyJSON`);
    return data.products;
  } catch (error) {
    console.error('❌ Error obteniendo productos de DummyJSON:', error.message);
    return [];
  }
};

// Función para obtener productos de JSONPlaceholder (como respaldo)
const fetchProductsFromJSONPlaceholder = async () => {
  try {
    console.log('🔄 Obteniendo productos de JSONPlaceholder...');
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const posts = await response.json();
    // Convertir posts en productos
    const products = posts.slice(0, 100).map((post, index) => ({
      id: post.id,
      title: post.title,
      description: post.body,
      price: Math.round((Math.random() * 500 + 10) * 100) / 100,
      category: ['electronics', 'clothing', 'home', 'sports'][Math.floor(Math.random() * 4)],
      image: `https://picsum.photos/400/400?random=${index}`
    }));
    console.log(`✅ Obtenidos ${products.length} productos de JSONPlaceholder`);
    return products;
  } catch (error) {
    console.error('❌ Error obteniendo productos de JSONPlaceholder:', error.message);
    return [];
  }
};

// Función para mapear productos a nuestro formato
const mapToOurFormat = (products, source) => {
  const categoryMapping = {
    "men's clothing": "66b3f0d35f68c23c4f0b9e0d", // Periféricos
    "women's clothing": "66b3f0d35f68c23c4f0b9e0d", // Periféricos
    "jewelery": "66b3f0d35f68c23c4f0b9e0c", // Audio
    "electronics": "66b3f0d35f68c23c4f0b9e0a", // Smartphones
    "smartphones": "66b3f0d35f68c23c4f0b9e0a",
    "laptops": "66b3f0d35f68c23c4f0b9e0b",
    "fragrances": "66b3f0d35f68c23c4f0b9e0c", // Audio
    "skincare": "66b3f0d35f68c23c4f0b9e0d", // Periféricos
    "groceries": "66b3f0d35f68c23c4f0b9e0d", // Periféricos
    "home-decoration": "66b3f0d35f68c23c4f0b9e0d", // Periféricos
    "automotive": "66b3f0d35f68c23c4f0b9e0b", // Laptops
    "motorcycle": "66b3f0d35f68c23c4f0b9e0b", // Laptops
    "lighting": "66b3f0d35f68c23c4f0b9e0c", // Audio
    "clothing": "66b3f0d35f68c23c4f0b9e0d", // Periféricos
    "home": "66b3f0d35f68c23c4f0b9e0d", // Periféricos
    "sports": "66b3f0d35f68c23c4f0b9e0d" // Periféricos
  };

  return products.map((product, index) => {
    // Determinar categoría basada en el nombre o categoría original
    let category = "66b3f0d35f68c23c4f0b9e0d"; // Default: Periféricos
    
    if (source === 'fakestore') {
      category = categoryMapping[product.category] || "66b3f0d35f68c23c4f0b9e0d";
    } else if (source === 'dummyjson') {
      // Para DummyJSON, usar la categoría directamente si existe
      if (product.category && categoryMapping[product.category.toLowerCase()]) {
        category = categoryMapping[product.category.toLowerCase()];
      } else {
        // Determinar por nombre del producto
        const name = product.title?.toLowerCase() || product.name?.toLowerCase() || '';
        if (name.includes('phone') || name.includes('iphone') || name.includes('samsung') || name.includes('pixel')) {
          category = "66b3f0d35f68c23c4f0b9e0a"; // Smartphones
        } else if (name.includes('laptop') || name.includes('macbook') || name.includes('dell') || name.includes('asus')) {
          category = "66b3f0d35f68c23c4f0b9e0b"; // Laptops
        } else if (name.includes('headphone') || name.includes('speaker') || name.includes('audio') || name.includes('jbl') || name.includes('sony')) {
          category = "66b3f0d35f68c23c4f0b9e0c"; // Audio
        }
      }
    } else if (source === 'jsonplaceholder') {
      category = categoryMapping[product.category] || "66b3f0d35f68c23c4f0b9e0d";
    }

    const productName = product.title || product.name || `Producto ${index + 1}`;
    
    // Usar imágenes de la API si están disponibles y son válidas, sino generar nuevas
    let images = [];
    if (product.image && 
        product.image !== "https://via.placeholder.com/400x400?text=Producto" &&
        product.image.startsWith('http')) {
      images = [product.image];
    } else {
      images = generateImageUrls(productName, index);
    }

    return {
      name: productName,
      description: product.description || product.body || `Descripción del producto ${index + 1}. Incluye garantía oficial y envío rápido.`,
      price: product.price || Math.round((Math.random() * 5000 + 100) * 100) / 100,
      discount: Math.floor(Math.random() * 25), // Descuento aleatorio 0-24%
      stock: Math.floor(Math.random() * 500) + 50, // Stock aleatorio 50-549
      category: category,
      images: images,
      reviews: [],
      isFeatured: Math.random() > 0.7 // 30% de productos destacados
    };
  });
};

// Función principal
const generateProducts = async () => {
  try {
    console.log('🚀 Iniciando generación de productos desde APIs...\n');

    let products = [];
    let source = '';

    // Intentar obtener productos de FakeStore primero (más confiable)
    products = await fetchProductsFromFakeStore();
    if (products.length > 0) {
      source = 'fakestore';
    }

    // Si FakeStore falla, intentar DummyJSON
    if (products.length === 0) {
      console.log('⚠️ FakeStore no disponible, intentando DummyJSON...');
      products = await fetchProductsFromDummyJSON(100);
      if (products.length > 0) {
        source = 'dummyjson';
      }
    }

    // Si DummyJSON también falla, usar JSONPlaceholder como último recurso
    if (products.length === 0) {
      console.log('⚠️ DummyJSON no disponible, intentando JSONPlaceholder...');
      products = await fetchProductsFromJSONPlaceholder();
      if (products.length > 0) {
        source = 'jsonplaceholder';
      }
    }

    if (products.length === 0) {
      throw new Error('No se pudieron obtener productos de ninguna API');
    }

    // Mapear a nuestro formato
    console.log('\n🔄 Mapeando productos a nuestro formato...');
    const mappedProducts = mapToOurFormat(products, source);

    // Si no tenemos 100 productos, crear más basados en los existentes
    if (mappedProducts.length < 100) {
      console.log(`⚠️ Solo tenemos ${mappedProducts.length} productos, creando más...`);
      
      const additionalProducts = [];
      const baseProducts = [...mappedProducts];
      
      for (let i = mappedProducts.length; i < 100; i++) {
        const baseProduct = baseProducts[i % baseProducts.length];
        const newProduct = {
          ...baseProduct,
          name: `${baseProduct.name} - Edición Especial ${Math.floor(i / baseProducts.length) + 1}`,
          price: Math.round((baseProduct.price * (0.7 + Math.random() * 0.6)) * 100) / 100,
          discount: Math.floor(Math.random() * 30),
          stock: Math.floor(Math.random() * 600) + 100,
          images: generateImageUrls(baseProduct.name, i)
        };
        additionalProducts.push(newProduct);
      }
      
      mappedProducts.push(...additionalProducts);
    }

    // Asegurar exactamente 100 productos
    const finalProducts = mappedProducts.slice(0, 100);

    // Guardar el JSON
    const outputPath = path.join(__dirname, '..', 'productos_generados_api.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalProducts, null, 2));

    console.log(`\n✅ ${finalProducts.length} productos generados y guardados en: ${outputPath}`);

    // Mostrar estadísticas
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
      const categoryName = {
        "66b3f0d35f68c23c4f0b9e0a": "Smartphones",
        "66b3f0d35f68c23c4f0b9e0b": "Laptops", 
        "66b3f0d35f68c23c4f0b9e0c": "Audio",
        "66b3f0d35f68c23c4f0b9e0d": "Periféricos"
      }[category] || category;
      console.log(`- ${categoryName}: ${count} productos`);
    });

    // Mostrar ejemplo de imágenes generadas
    console.log('\n🖼️ Ejemplo de imágenes generadas:');
    finalProducts.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}:`);
      product.images.forEach((img, imgIndex) => {
        console.log(`   - Imagen ${imgIndex + 1}: ${img}`);
      });
    });

    console.log(`\n🎯 API utilizada: ${source.toUpperCase()}`);

  } catch (error) {
    console.error('❌ Error generando productos:', error.message);
  }
};

// Ejecutar el script
generateProducts(); 