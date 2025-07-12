# Controladores de Usuarios

Esta carpeta contiene los controladores relacionados con la gestión de usuarios, organizados por funcionalidad para mejor mantenibilidad y escalabilidad.

## 📁 Estructura

```
controllers/users/
├── authController.js      # Autenticación y registro
├── profileController.js   # Gestión de perfiles
├── adminController.js     # Operaciones de administrador
├── favoritesController.js # Gestión de favoritos
├── index.js              # Exportaciones centralizadas
└── README.md             # Esta documentación
```

## 🔧 Controladores

### **authController.js**
- `createUser` - Crear nuevo usuario (registro público)

### **profileController.js**
- `getProfile` - Obtener perfil del usuario autenticado
- `updateProfile` - Actualizar perfil del usuario
- `changePassword` - Cambiar contraseña

### **adminController.js**
- `getAllUsers` - Obtener todos los usuarios (con paginación y búsqueda)
- `getUserById` - Obtener usuario específico por ID
- `updateUser` - Actualizar usuario (admin)
- `deleteUser` - Eliminar usuario (admin)

### **favoritesController.js**
- `getFavorites` - Obtener favoritos del usuario
- `addToFavorites` - Agregar producto a favoritos
- `removeFromFavorites` - Remover producto de favoritos

## 🚀 Uso

```javascript
// Importar controladores específicos
import { createUser } from '../controllers/users/authController.js';
import { getProfile } from '../controllers/users/profileController.js';

// O importar desde el índice
import { 
  createUser, 
  getProfile, 
  getAllUsers 
} from '../controllers/users/index.js';
```

## ✅ Beneficios de esta estructura

1. **Separación de responsabilidades** - Cada controlador tiene una función específica
2. **Mantenibilidad** - Fácil de mantener y actualizar
3. **Escalabilidad** - Fácil agregar nuevos controladores
4. **Legibilidad** - Código más organizado y fácil de entender
5. **Reutilización** - Controladores pueden ser reutilizados en diferentes rutas
6. **Testing** - Más fácil escribir pruebas unitarias

## 🔄 Migración

Si necesitas agregar nuevas funcionalidades:

1. Crea un nuevo archivo de controlador (ej: `ordersController.js`)
2. Implementa las funciones necesarias
3. Exporta las funciones en `index.js`
4. Importa y usa en las rutas correspondientes

## 📝 Convenciones

- Usar nombres descriptivos para los archivos
- Exportar funciones individuales, no objetos
- Mantener consistencia en el manejo de errores
- Documentar funciones complejas
- Seguir el patrón de respuesta estándar 