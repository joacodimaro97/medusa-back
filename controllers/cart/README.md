# Controladores de Carrito

Este directorio contiene los controladores para la gestión completa de carritos de compra, organizados por funcionalidad para mejorar la mantenibilidad y escalabilidad del código.

## Estructura de Archivos

### `cartController.js` - CRUD Básico
Contiene las operaciones fundamentales de carritos:

- **createCart**: Crear nuevo carrito (usuario o visitante)
- **getCart**: Obtener carrito por ID
- **getMyCart**: Obtener carrito del usuario autenticado
- **updateCart**: Actualizar carrito (convertir visitante a usuario)
- **deleteCart**: Eliminar carrito
- **getAllCarts**: Obtener todos los carritos (admin)

### `itemsController.js` - Gestión de Items
Maneja las operaciones de productos en el carrito:

- **addItemToCart/addItemToMyCart**: Agregar producto al carrito
- **updateItemQuantity/updateItemQuantityInMyCart**: Actualizar cantidad
- **removeItemFromCart/removeItemFromMyCart**: Remover producto
- **clearCart/clearMyCart**: Limpiar carrito completo

### `totalsController.js` - Cálculos y Totales
Controla los cálculos financieros y resúmenes:

- **calculateCartTotals/calculateMyCartTotals**: Calcular totales
- **getCartSummary/getMyCartSummary**: Obtener resumen detallado
- **checkCartAvailability/checkMyCartAvailability**: Verificar disponibilidad

## Características Principales

### Gestión Dual (Usuario/Visitante)
- Soporte para carritos de usuarios autenticados
- Soporte para carritos de visitantes (guest carts)
- Conversión automática de visitante a usuario
- Validación de existencia de usuarios

### Validaciones de Stock
- Verificación automática de stock disponible
- Prevención de agregar productos sin stock
- Ajuste automático de cantidades según disponibilidad
- Mensajes informativos sobre stock insuficiente

### Cálculos Automáticos
- Subtotal por producto
- Descuentos aplicados
- Total general del carrito
- Conteo de items únicos y totales
- Redondeo a 2 decimales

### Gestión de Items
- Agregar productos con cantidades
- Actualizar cantidades existentes
- Remover productos individuales
- Limpiar carrito completo
- Validación de cantidades mínimas

## Endpoints Disponibles

### Públicos
- `GET /cart/public` - Obtener carrito por userId/visitorId

### Usuario Autenticado
- `GET /cart/my-cart` - Obtener mi carrito
- `POST /cart/my-cart/items` - Agregar producto a mi carrito
- `PUT /cart/my-cart/items/:productId` - Actualizar cantidad
- `DELETE /cart/my-cart/items/:productId` - Remover producto
- `DELETE /cart/my-cart/clear` - Limpiar mi carrito
- `GET /cart/my-cart/totals` - Calcular totales
- `GET /cart/my-cart/summary` - Obtener resumen
- `GET /cart/my-cart/availability` - Verificar disponibilidad

### Administrador
- `POST /cart` - Crear carrito
- `GET /cart/:cartId` - Obtener carrito específico
- `PUT /cart/:cartId` - Actualizar carrito
- `DELETE /cart/:cartId` - Eliminar carrito
- `GET /cart` - Listar todos los carritos
- `POST /cart/:cartId/items` - Agregar item a carrito
- `PUT /cart/:cartId/items/:productId` - Actualizar cantidad
- `DELETE /cart/:cartId/items/:productId` - Remover item
- `DELETE /cart/:cartId/clear` - Limpiar carrito
- `GET /cart/:cartId/totals` - Calcular totales
- `GET /cart/:cartId/summary` - Obtener resumen
- `GET /cart/:cartId/availability` - Verificar disponibilidad

## Ejemplos de Uso

### Crear Carrito para Usuario
```json
{
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

### Crear Carrito para Visitante
```json
{
  "visitorId": "visitor_123456"
}
```

### Agregar Producto al Carrito
```json
{
  "productId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "quantity": 2
}
```

### Respuesta de Totales
```json
{
  "success": true,
  "data": {
    "cartId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "items": [...],
    "totals": {
      "subtotal": 1999.98,
      "totalDiscount": 199.99,
      "total": 1999.98,
      "itemCount": 3
    }
  }
}
```

### Respuesta de Resumen
```json
{
  "success": true,
  "data": {
    "cartId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "itemCount": 3,
    "uniqueItems": 2,
    "subtotal": 1999.98,
    "totalDiscount": 199.99,
    "total": 1999.98,
    "items": [
      {
        "productId": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "iPhone 15 Pro",
        "price": 999.99,
        "discount": 10,
        "finalPrice": 899.99,
        "quantity": 2,
        "subtotal": 1799.98,
        "image": "https://i.postimg.cc/...",
        "stock": 50
      }
    ]
  }
}
```

## Validaciones de Seguridad

### Gestión de Usuarios
- Verificación de existencia de usuarios
- Prevención de carritos duplicados por usuario
- Validación de permisos de acceso

### Gestión de Stock
- Verificación de stock antes de agregar productos
- Validación de cantidades mínimas
- Prevención de cantidades negativas

### Gestión de Carritos
- Validación de existencia antes de operaciones
- Verificación de propiedad del carrito
- Limpieza automática de carritos vacíos

## Integración con Productos

### Relaciones Bidireccionales
- Los carritos mantienen referencia a productos
- Validación automática de productos existentes
- Populate automático de información de productos

### Cálculos en Tiempo Real
- Actualización automática de totales
- Cálculo de descuentos por producto
- Verificación de disponibilidad dinámica 