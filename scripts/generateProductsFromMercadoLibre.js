import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Configuración de MercadoLibre API
const MERCADOLIBRE_CONFIG = {
  CLIENT_ID: process.env.MERCADOLIBRE_CLIENT_ID,
  CLIENT_SECRET: process.env.MERCADOLIBRE_CLIENT_SECRET,
  REDIRECT_URI: process.env.MERCADOLIBRE_REDIRECT_URI || 'https://medusa.com',
  BASE_URL: 'https://api.mercadolibre.com',
  SITE_ID: 'MLA' // Argentina
};

// Función para obtener el token de acceso
const getAccessToken = async () => {
  try {
    console.log('🔄 Obteniendo token de acceso de MercadoLibre...');
    
    if (!MERCADOLIBRE_CONFIG.CLIENT_ID || !MERCADOLIBRE_CONFIG.CLIENT_SECRET) {
      console.log('❌ CLIENT_ID y CLIENT_SECRET no están configurados');
      console.log('💡 Ejecuta primero: node scripts/setupMercadoLibre.js');
      return null;
    }
    
    // URL de autorización
    const authUrl = `${MERCADOLIBRE_CONFIG.BASE_URL}/authorization?response_type=code&client_id=${MERCADOLIBRE_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(MERCADOLIBRE_CONFIG.REDIRECT_URI)}`;
    
    console.log('📋 Para obtener el token, sigue estos pasos:');
    console.log('1. Ve a esta URL:', authUrl);
    console.log('2. Autoriza la aplicación');
    console.log('3. Copia el código de autorización de la URL de redirección');
    console.log('4. Ejecuta el script con el código como parámetro');
    
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    return null;
  }
};

// Función para intercambiar código por token
const exchangeCodeForToken = async (authorizationCode) => {
  try {
    console.log('🔄 Intercambiando código por token...');
    
    const response = await fetch(`${MERCADOLIBRE_CONFIG.BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: MERCADOLIBRE_CONFIG.CLIENT_ID,
        client_secret: MERCADOLIBRE_CONFIG.CLIENT_SECRET,
        code: authorizationCode,
        redirect_uri: MERCADOLIBRE_CONFIG.REDIRECT_URI
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Token obtenido exitosamente');
    return data.access_token;
  } catch (error) {
    console.error('❌ Error intercambiando código por token:', error.message);
    return null;
  }
};

// Función para buscar productos en MercadoLibre con autenticación
const searchProducts = async (accessToken, query = 'smartphone', limit = 50) => {
  try {
    console.log(`🔍 Buscando productos: ${query}`);
    
    const response = await fetch(`${MERCADOLIBRE_CONFIG.BASE_URL}/sites/${MERCADOLIBRE_CONFIG.SITE_ID}/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Encontrados ${data.results.length} productos para "${query}"`);
    return data.results;
  } catch (error) {
    console.error(`❌ Error buscando productos "${query}":`, error.message);
    return [];
  }
};

// Función para obtener detalles de un producto
const getProductDetails = async (accessToken, productId) => {
  try {
    const response = await fetch(`${MERCADOLIBRE_CONFIG.BASE_URL}/items/${productId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error obteniendo detalles del producto ${productId}:`, error.message);
    return null;
  }
};

// Función para obtener productos populares por categoría
const getPopularProducts = async (accessToken, categoryId, limit = 20) => {
  try {
    console.log(`🔍 Obteniendo productos populares de categoría: ${categoryId}`);
    
    const response = await fetch(`${MERCADOLIBRE_CONFIG.BASE_URL}/sites/${MERCADOLIBRE_CONFIG.SITE_ID}/search?category=${categoryId}&sort=relevance&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Encontrados ${data.results.length} productos populares`);
    return data.results;
  } catch (error) {
    console.error(`❌ Error obteniendo productos populares:`, error.message);
    return [];
  }
};

// Función para obtener mis productos (si tienes una cuenta de vendedor)
const getMyProducts = async (accessToken, limit = 50) => {
  try {
    console.log('🔍 Obteniendo mis productos...');
    
    const response = await fetch(`${MERCADOLIBRE_CONFIG.BASE_URL}/my/recent/listings?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Encontrados ${data.results.length} de mis productos`);
    return data.results;
  } catch (error) {
    console.error('❌ Error obteniendo mis productos:', error.message);
    return [];
  }
};

// Función para mapear productos de MercadoLibre a nuestro formato
const mapMercadoLibreToOurFormat = (products) => {
  const categoryMapping = {
    "MLA1051": "66b3f0d35f68c23c4f0b9e0a", // Smartphones
    "MLA1648": "66b3f0d35f68c23c4f0b9e0b", // Laptops
    "MLA1000": "66b3f0d35f68c23c4f0b9e0c", // Audio
    "MLA5726": "66b3f0d35f68c23c4f0b9e0d", // Periféricos
    "MLA1144": "66b3f0d35f68c23c4f0b9e0d", // Periféricos
    "MLA1039": "66b3f0d35f68c23c4f0b9e0d"  // Periféricos
  };

  return products.map((product, index) => {
    // Determinar categoría
    let category = "66b3f0d35f68c23c4f0b9e0d"; // Default: Periféricos
    
    if (product.category_id && categoryMapping[product.category_id]) {
      category = categoryMapping[product.category_id];
    } else {
      // Determinar por título
      const title = product.title?.toLowerCase() || '';
      if (title.includes('iphone') || title.includes('samsung') || title.includes('motorola') || title.includes('xiaomi') || title.includes('celular')) {
        category = "66b3f0d35f68c23c4f0b9e0a"; // Smartphones
      } else if (title.includes('laptop') || title.includes('notebook') || title.includes('macbook') || title.includes('dell') || title.includes('computadora')) {
        category = "66b3f0d35f68c23c4f0b9e0b"; // Laptops
      } else if (title.includes('auricular') || title.includes('headphone') || title.includes('speaker') || title.includes('jbl') || title.includes('parlante')) {
        category = "66b3f0d35f68c23c4f0b9e0c"; // Audio
      }
    }

    // Procesar imágenes
    let images = [];
    if (product.pictures && product.pictures.length > 0) {
      images = product.pictures.map(pic => pic.url);
    } else if (product.thumbnail) {
      images = [product.thumbnail.replace('-I.jpg', '-F.jpg')]; // Imagen de alta calidad
    } else {
      images = [`https://picsum.photos/400/400?random=${index}`];
    }

    return {
      name: product.title || `Producto ${index + 1}`,
      description: product.description || `Descripción del producto ${index + 1}. Incluye garantía oficial y envío rápido.`,
      price: product.price || Math.round((Math.random() * 5000 + 100) * 100) / 100,
      discount: Math.floor(Math.random() * 25), // Descuento aleatorio 0-24%
      stock: Math.floor(Math.random() * 500) + 50, // Stock aleatorio 50-549
      category: category,
      images: images,
      reviews: [],
      isFeatured: Math.random() > 0.7, // 30% de productos destacados
      originalId: product.id,
      originalUrl: product.permalink,
      seller: product.seller?.nickname || 'Vendedor Verificado',
      condition: product.condition || 'new',
      availableQuantity: product.available_quantity || Math.floor(Math.random() * 100) + 1
    };
  });
};

// Función principal
const generateProductsFromMercadoLibre = async (authorizationCode = null) => {
  try {
    console.log('🚀 Iniciando generación de productos desde MercadoLibre (OAuth2)...\n');

    let accessToken = null;

    if (authorizationCode) {
      accessToken = await exchangeCodeForToken(authorizationCode);
    } else {
      accessToken = await getAccessToken();
    }

    if (!accessToken) {
      console.log('\n❌ No se pudo obtener el token de acceso');
      console.log('💡 Ejecuta el script con el código de autorización:');
      console.log('   node scripts/generateProductsFromMercadoLibre.js TU_CODIGO_AQUI');
      return;
    }

    // Categorías populares de MercadoLibre Argentina
    const categories = [
      { id: 'MLA1051', name: 'Smartphones', query: 'celular smartphone' },
      { id: 'MLA1648', name: 'Laptops', query: 'laptop notebook computadora' },
      { id: 'MLA1000', name: 'Audio', query: 'auriculares parlantes speaker' },
      { id: 'MLA5726', name: 'Periféricos', query: 'teclado mouse monitor' }
    ];

    // Búsquedas adicionales
    const searchQueries = [
      'iphone',
      'samsung galaxy',
      'xiaomi',
      'macbook',
      'dell laptop',
      'auriculares bluetooth',
      'teclado mecánico',
      'mouse gaming',
      'monitor 4k',
      'tablet',
      'smartwatch',
      'cámara digital',
      'altavoces jbl',
      'webcam',
      'microfono'
    ];

    let allProducts = [];

    // Obtener productos por categorías
    console.log('📂 Obteniendo productos por categorías...');
    for (const category of categories) {
      const products = await getPopularProducts(accessToken, category.id, 15);
      allProducts = allProducts.concat(products);
      
      // Esperar un poco entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Obtener productos por búsquedas específicas
    console.log('🔍 Obteniendo productos por búsquedas específicas...');
    for (const query of searchQueries) {
      const products = await searchProducts(accessToken, query, 8);
      allProducts = allProducts.concat(products);
      
      // Esperar un poco entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Intentar obtener mis productos (si tienes una cuenta de vendedor)
    console.log('🛍️ Intentando obtener mis productos...');
    const myProducts = await getMyProducts(accessToken, 20);
    if (myProducts.length > 0) {
      allProducts = allProducts.concat(myProducts);
    }

    // Eliminar duplicados por ID
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );

    console.log(`\n📊 Total de productos únicos obtenidos: ${uniqueProducts.length}`);

    if (uniqueProducts.length === 0) {
      throw new Error('No se pudieron obtener productos de MercadoLibre');
    }

    // Mapear a nuestro formato
    console.log('\n🔄 Mapeando productos a nuestro formato...');
    const mappedProducts = mapMercadoLibreToOurFormat(uniqueProducts);

    // Asegurar exactamente 100 productos
    const finalProducts = mappedProducts.slice(0, 100);

    // Si no tenemos 100 productos, duplicar algunos con variaciones
    if (finalProducts.length < 100) {
      console.log(`⚠️ Solo tenemos ${finalProducts.length} productos, creando variaciones...`);
      
      const additionalProducts = [];
      const baseProducts = [...finalProducts];
      
      for (let i = finalProducts.length; i < 100; i++) {
        const baseProduct = baseProducts[i % baseProducts.length];
        const newProduct = {
          ...baseProduct,
          name: `${baseProduct.name} - Variante ${Math.floor(i / baseProducts.length) + 1}`,
          price: Math.round((baseProduct.price * (0.8 + Math.random() * 0.4)) * 100) / 100,
          discount: Math.floor(Math.random() * 30),
          stock: Math.floor(Math.random() * 600) + 100,
          originalId: `${baseProduct.originalId}_variant_${i}`,
          originalUrl: baseProduct.originalUrl
        };
        additionalProducts.push(newProduct);
      }
      
      finalProducts.push(...additionalProducts);
    }

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

    // Mostrar ejemplo de productos
    console.log('\n🛍️ Ejemplo de productos obtenidos:');
    finalProducts.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Precio: $${product.price}`);
      console.log(`   Categoría: ${product.category}`);
      console.log(`   Imágenes: ${product.images.length}`);
      console.log(`   Vendedor: ${product.seller}`);
      console.log(`   Condición: ${product.condition}`);
      if (product.originalUrl) {
        console.log(`   URL original: ${product.originalUrl}`);
      }
      console.log('');
    });

    console.log('\n🎯 Productos obtenidos de MercadoLibre Argentina (OAuth2)');
    console.log('💡 Los productos incluyen información real: precios, imágenes, vendedores y URLs originales');

  } catch (error) {
    console.error('❌ Error generando productos:', error.message);
  }
};

// Obtener código de autorización de los argumentos de línea de comandos
const authorizationCode = process.argv[2];

// Ejecutar el script
generateProductsFromMercadoLibre(authorizationCode); 