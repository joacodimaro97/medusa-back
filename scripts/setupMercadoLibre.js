import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de MercadoLibre API
const MERCADOLIBRE_CONFIG = {
  BASE_URL: 'https://api.mercadolibre.com',
  REDIRECT_URI: 'https://medusa.com'
};

// Función para crear archivo .env
const createEnvFile = (clientId, clientSecret) => {
  const envContent = `# Configuración de la base de datos
MONGODB_URI=mongodb+srv://medusa:medusa123@cluster0.4txkmuv.mongodb.net/medusa?retryWrites=true&w=majority

# Configuración de MercadoLibre API
MERCADOLIBRE_CLIENT_ID=${clientId}
MERCADOLIBRE_CLIENT_SECRET=${clientSecret}
MERCADOLIBRE_REDIRECT_URI=${MERCADOLIBRE_CONFIG.REDIRECT_URI}

# Configuración del servidor
PORT=3000
NODE_ENV=development
`;

  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado exitosamente');
};

// Función para obtener el código de autorización
const getAuthorizationCode = (clientId) => {
  const authUrl = `${MERCADOLIBRE_CONFIG.BASE_URL}/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(MERCADOLIBRE_CONFIG.REDIRECT_URI)}`;
  
  console.log('\n📋 PASOS PARA AUTENTICARSE:');
  console.log('1. Ve a esta URL:', authUrl);
  console.log('2. Inicia sesión en MercadoLibre si no lo has hecho');
  console.log('3. Autoriza la aplicación');
  console.log('4. Serás redirigido a una URL como: https://medusa.com?code=TU_CODIGO_AQUI');
  console.log('5. Copia el código de la URL (la parte después de code=)');
  
  return authUrl;
};

// Función para intercambiar código por token
const exchangeCodeForToken = async (clientId, clientSecret, authorizationCode) => {
  try {
    console.log('\n🔄 Intercambiando código por token...');
    
    const response = await fetch(`${MERCADOLIBRE_CONFIG.BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
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
    console.log('📝 Token de acceso:', data.access_token);
    console.log('📝 Token de refresco:', data.refresh_token);
    
    return data.access_token;
  } catch (error) {
    console.error('❌ Error intercambiando código por token:', error.message);
    return null;
  }
};

// Función para probar la API con el token
const testAPI = async (accessToken) => {
  try {
    console.log('\n🧪 Probando la API de MercadoLibre...');
    
    const response = await fetch(`${MERCADOLIBRE_CONFIG.BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const userData = await response.json();
    console.log('✅ API funcionando correctamente');
    console.log('👤 Usuario autenticado:', userData.nickname);
    console.log('🆔 ID de usuario:', userData.id);
    
    return true;
  } catch (error) {
    console.error('❌ Error probando la API:', error.message);
    return false;
  }
};

// Función principal
const setupMercadoLibre = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log('🚀 Configuración de MercadoLibre API\n');
    
    // Paso 1: Solicitar CLIENT_ID
    const clientId = await new Promise((resolve) => {
      rl.question('📝 Ingresa tu CLIENT_ID de MercadoLibre: ', resolve);
    });

    if (!clientId || clientId.trim() === '') {
      console.log('❌ CLIENT_ID es requerido');
      rl.close();
      return;
    }

    // Paso 2: Solicitar CLIENT_SECRET
    const clientSecret = await new Promise((resolve) => {
      rl.question('📝 Ingresa tu CLIENT_SECRET de MercadoLibre: ', resolve);
    });

    if (!clientSecret || clientSecret.trim() === '') {
      console.log('❌ CLIENT_SECRET es requerido');
      rl.close();
      return;
    }

    // Paso 3: Crear archivo .env
    console.log('\n📁 Creando archivo .env...');
    createEnvFile(clientId.trim(), clientSecret.trim());

    // Paso 4: Obtener URL de autorización
    const authUrl = getAuthorizationCode(clientId.trim());

    // Paso 5: Solicitar código de autorización
    const authorizationCode = await new Promise((resolve) => {
      rl.question('\n📝 Ingresa el código de autorización: ', resolve);
    });

    if (!authorizationCode || authorizationCode.trim() === '') {
      console.log('❌ Código de autorización es requerido');
      rl.close();
      return;
    }

    // Paso 6: Intercambiar código por token
    const accessToken = await exchangeCodeForToken(
      clientId.trim(), 
      clientSecret.trim(), 
      authorizationCode.trim()
    );

    if (!accessToken) {
      console.log('❌ No se pudo obtener el token de acceso');
      rl.close();
      return;
    }

    // Paso 7: Probar la API
    const apiWorking = await testAPI(accessToken);

    if (apiWorking) {
      console.log('\n🎉 ¡Configuración completada exitosamente!');
      console.log('💡 Ahora puedes ejecutar: node scripts/generateProductsFromMercadoLibre.js');
    } else {
      console.log('\n⚠️ La configuración se completó pero hay problemas con la API');
    }

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  } finally {
    rl.close();
  }
};

// Ejecutar el script
setupMercadoLibre(); 