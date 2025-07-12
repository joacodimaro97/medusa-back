# Medusa Backend

Backend de la aplicación Medusa construido con Express.js, MongoDB y ES6 Modules.

## 🚀 Características

- **ES6 Modules**: Uso completo de `import/export`
- **MongoDB**: Base de datos NoSQL con Mongoose
- **JWT Authentication**: Autenticación con tokens JWT
- **Security**: Helmet y CORS configurados
- **Error Handling**: Manejo centralizado de errores
- **Validation**: Validación de datos con Mongoose

## 📋 Prerrequisitos

- Node.js (versión 14 o superior)
- MongoDB instalado y corriendo
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd medusa-back
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus configuraciones:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/medusa_db
   JWT_SECRET=tu_jwt_secret_super_seguro_aqui
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Iniciar MongoDB**
   ```bash
   mongod
   ```

## 🏃‍♂️ Ejecutar

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 📚 API Endpoints

### Base
- `GET /` - Información de la API
- `GET /health` - Health check

### Usuarios
- `GET /users` - Obtener todos los usuarios (Admin)
- `GET /users/profile` - Obtener perfil del usuario
- `PUT /users/profile` - Actualizar perfil del usuario

## 🏗️ Estructura del Proyecto

```
medusa-back/
├── bin/
│   └── www                 # Punto de entrada del servidor
├── config/
│   └── database.js         # Configuración de MongoDB
├── controllers/            # Controladores de la API
├── middleware/
│   └── auth.js            # Middleware de autenticación
├── models/
│   ├── Product.js         # Modelo de Producto
│   └── User.js           # Modelo de Usuario
├── routes/
│   ├── index.js          # Rutas principales
│   └── users.js          # Rutas de usuarios
├── app.js                # Configuración de Express
├── package.json
└── README.md
```

## 🔧 Tecnologías Utilizadas

- **Express.js**: Framework web para Node.js
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación con tokens
- **bcryptjs**: Hash de contraseñas
- **Helmet**: Seguridad HTTP
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Variables de entorno

## 📝 Scripts Disponibles

- `npm start`: Inicia el servidor en producción
- `npm run dev`: Inicia el servidor en desarrollo con nodemon
- `npm test`: Ejecuta las pruebas (pendiente)

## 🔐 Autenticación

La API utiliza JWT para la autenticación. Para acceder a rutas protegidas, incluye el token en el header:

```
Authorization: Bearer <tu-token-jwt>
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 