# Scripts de Base de Datos

Este directorio contiene scripts para gestionar la base de datos de productos y categorías.

## Scripts Disponibles

### 1. `seedProducts.js` - Insertar Productos
Este script inserta los 100 productos del archivo `productos_tecnologia_realistas.json` en la base de datos.

**Características:**
- ✅ Crea automáticamente las categorías necesarias
- ✅ Evita duplicados (verifica por nombre y categoría)
- ✅ Actualiza las referencias en las categorías
- ✅ Muestra progreso detallado
- ✅ Manejo de errores robusto

**Uso:**
```bash
cd medusa-back
node scripts/seedProducts.js
```

### 2. `clearDatabase.js` - Limpiar Base de Datos
Este script elimina todos los productos y categorías de la base de datos.

**⚠️ ADVERTENCIA:** Este script eliminará TODOS los datos existentes.

**Uso:**
```bash
cd medusa-back
node scripts/clearDatabase.js
```

## Categorías Creadas

El script creará automáticamente estas categorías:

| ID | Nombre | Descripción |
|----|--------|-------------|
| `66b3f0d35f68c23c4f0b9e0a` | Smartphones | Teléfonos móviles y smartphones de última generación |
| `66b3f0d35f68c23c4f0b9e0b` | Laptops | Portátiles y laptops para trabajo y gaming |
| `66b3f0d35f68c23c4f0b9e0c` | Audio | Auriculares, altavoces y dispositivos de audio |
| `66b3f0d35f68c23c4f0b9e0d` | Periféricos | Teclados, ratones y otros periféricos de computadora |

## Flujo de Trabajo Recomendado

1. **Primera vez o reset completo:**
   ```bash
   node scripts/clearDatabase.js
   node scripts/seedProducts.js
   ```

2. **Solo insertar productos (si ya tienes categorías):**
   ```bash
   node scripts/seedProducts.js
   ```

## Variables de Entorno

Asegúrate de tener configurada la variable `MONGODB_URI` en tu archivo `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/medusa_db
```

## Salida del Script

El script mostrará información detallada sobre el proceso:

```
✅ MongoDB conectado: localhost:27017

🏷️ Verificando categorías...
✅ Categoría creada: Smartphones
✅ Categoría creada: Laptops
✅ Categoría creada: Audio
✅ Categoría creada: Periféricos

📦 Insertando productos...
✅ Producto insertado: Google Pixel 9 Pro 256GB Edición 2025
✅ Producto insertado: Samsung Galaxy S25 Ultra 512GB Edición 2023
...

📊 Resumen de la inserción:
✅ Productos insertados: 100
⏭️ Productos omitidos: 0
📦 Total procesados: 100

🎉 ¡Proceso completado exitosamente!
```

## Solución de Problemas

### Error de conexión a MongoDB
- Verifica que MongoDB esté ejecutándose
- Revisa la URL de conexión en tu archivo `.env`

### Error de archivo no encontrado
- Asegúrate de que el archivo `productos_tecnologia_realistas.json` esté en la raíz del proyecto

### Error de validación
- Los productos que no cumplan con las validaciones del modelo serán omitidos
- Revisa la consola para ver qué productos fallaron y por qué 