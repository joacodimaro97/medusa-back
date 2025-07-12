# Controladores de Categorías

Este directorio contiene los controladores para la gestión completa de categorías, organizados por funcionalidad para mejorar la mantenibilidad y escalabilidad del código.

## Estructura de Archivos

### `categoryController.js` - CRUD Básico
Contiene las operaciones fundamentales de categorías:

- **createCategory**: Crear nueva categoría
- **getAllCategories**: Obtener todas las categorías con filtros
- **getCategoryById**: Obtener categoría específica por ID
- **updateCategory**: Actualizar categoría existente
- **deleteCategory**: Eliminar categoría (solo si no tiene productos)

### `statsController.js` - Estadísticas y Análisis
Maneja las operaciones de análisis y estadísticas:

- **getCategoryStats**: Estadísticas completas de todas las categorías
- **getTopCategories**: Categorías con más productos
- **getEmptyCategories**: Categorías sin productos

## Características Principales

### Filtros Avanzados
- Búsqueda por texto (nombre y descripción)
- Ordenamiento personalizable
- Paginación completa

### Validaciones
- Verificación de nombres únicos
- Prevención de eliminación de categorías con productos
- Validación de datos de entrada

### Relaciones Automáticas
- Populate automático de productos en categorías
- Cálculo de estadísticas en tiempo real
- Sincronización con productos

### Estadísticas Avanzadas
- Conteo de productos por categoría
- Valor total de inventario
- Precio promedio por categoría
- Productos con stock bajo
- Productos sin stock

## Endpoints Disponibles

### Públicos
- `GET /categories` - Listar categorías
- `GET /categories/:id` - Obtener categoría específica
- `GET /categories/stats/top` - Categorías principales

### Administrador
- `POST /categories` - Crear categoría
- `PUT /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría
- `GET /categories/admin/stats` - Estadísticas completas
- `GET /categories/admin/empty` - Categorías vacías

## Ejemplos de Uso

### Crear Categoría
```json
{
  "name": "Electrónicos",
  "description": "Productos electrónicos y tecnológicos"
}
```

### Actualizar Categoría
```json
{
  "name": "Tecnología",
  "description": "Productos tecnológicos y gadgets"
}
```

### Respuesta de Estadísticas
```json
{
  "success": true,
  "data": [
    {
      "name": "Electrónicos",
      "description": "Productos electrónicos",
      "productCount": 15,
      "totalValue": 15000.50,
      "averagePrice": 1000.03,
      "lowStockProducts": 3,
      "outOfStockProducts": 1
    }
  ]
}
```

## Validaciones de Seguridad

### Eliminación de Categorías
- No se puede eliminar una categoría que tenga productos
- Se requiere permisos de administrador
- Validación de existencia antes de eliminar

### Creación y Actualización
- Nombres únicos obligatorios
- Validación de formato de datos
- Prevención de duplicados

## Integración con Productos

### Relaciones Bidireccionales
- Las categorías mantienen referencia a sus productos
- Los productos mantienen referencia a su categoría
- Sincronización automática al crear/eliminar productos

### Estadísticas en Tiempo Real
- Cálculo automático de métricas
- Actualización dinámica de conteos
- Análisis de rendimiento por categoría 