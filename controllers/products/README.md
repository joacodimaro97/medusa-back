# Controladores de Productos

Este directorio contiene los controladores para la gestión completa de productos, organizados por funcionalidad para mejorar la mantenibilidad y escalabilidad del código.

## Estructura de Archivos

### `productController.js` - CRUD Básico
Contiene las operaciones fundamentales de productos:

- **createProduct**: Crear nuevo producto
- **getAllProducts**: Obtener todos los productos con filtros avanzados
- **getProductById**: Obtener producto específico por ID
- **updateProduct**: Actualizar producto existente
- **deleteProduct**: Eliminar producto

### `stockController.js` - Gestión de Inventario
Maneja todas las operaciones relacionadas con el stock:

- **updateStock**: Actualizar stock (add/subtract/set)
- **getLowStockProducts**: Productos con stock bajo
- **getOutOfStockProducts**: Productos sin stock
- **checkAvailability**: Verificar disponibilidad

### `discountController.js` - Gestión de Descuentos
Controla las operaciones de descuentos:

- **applyDiscount**: Aplicar descuento a producto
- **removeDiscount**: Remover descuento
- **getDiscountedProducts**: Obtener productos con descuento
- **applyBulkDiscount**: Descuento masivo por categoría

### `featuredController.js` - Productos Destacados
Maneja los productos destacados:

- **markAsFeatured**: Marcar como destacado
- **removeFromFeatured**: Remover de destacados
- **getFeaturedProducts**: Obtener productos destacados
- **markMultipleAsFeatured**: Marcar múltiples como destacados

## Características Principales

### Filtros Avanzados
- Búsqueda por texto (nombre y descripción)
- Filtro por categoría
- Filtro por rango de precios
- Filtro por disponibilidad de stock
- Filtro por productos destacados
- Ordenamiento personalizable

### Paginación
Todas las consultas de listado incluyen paginación con:
- Página actual
- Total de páginas
- Total de productos
- Productos por página

### Relaciones Automáticas
- Sincronización automática con categorías
- Populate de relaciones relevantes
- Validación de existencia de entidades relacionadas

### Validaciones
- Validación de URLs de imágenes (ipostimage)
- Validación de rangos de precios y descuentos
- Validación de stock no negativo
- Validación de existencia de categorías

## Uso de Imágenes

Las imágenes se manejan mediante URLs de ipostimage:
- Formato: `https://i.postimg.cc/...`
- Validación automática de formato URL
- Soporte para múltiples imágenes por producto

## Endpoints Disponibles

### Públicos
- `GET /products` - Listar productos
- `GET /products/:id` - Obtener producto
- `GET /products/featured/list` - Productos destacados
- `GET /products/discounted/list` - Productos con descuento
- `GET /products/:id/availability` - Verificar disponibilidad

### Administrador
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto
- `PUT /products/:id/stock` - Actualizar stock
- `GET /products/admin/low-stock` - Stock bajo
- `GET /products/admin/out-of-stock` - Sin stock
- `PUT /products/:id/discount` - Aplicar descuento
- `DELETE /products/:id/discount` - Remover descuento
- `POST /products/admin/bulk-discount` - Descuento masivo
- `PUT /products/:id/featured` - Marcar destacado
- `DELETE /products/:id/featured` - Remover destacado
- `POST /products/admin/bulk-featured` - Destacados masivos

## Ejemplos de Uso

### Crear Producto
```json
{
  "name": "iPhone 15 Pro",
  "description": "El último iPhone con características avanzadas",
  "price": 999.99,
  "discount": 10,
  "stock": 50,
  "category": "64f1a2b3c4d5e6f7g8h9i0j1",
  "images": [
    "https://i.postimg.cc/abc123/iphone15pro.jpg",
    "https://i.postimg.cc/def456/iphone15pro-back.jpg"
  ],
  "isFeatured": true
}
```

### Actualizar Stock
```json
{
  "quantity": 5,
  "operation": "add"
}
```

### Aplicar Descuento
```json
{
  "discountPercentage": 15
}
``` 