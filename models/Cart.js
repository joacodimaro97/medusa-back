import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El ID del producto es requerido']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  visitorId: {
    type: String,
    required: false,
    trim: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// Validación: al menos userId o visitorId debe estar presente
cartSchema.pre('save', function(next) {
  if (!this.userId && !this.visitorId) {
    return next(new Error('Debe proporcionar userId o visitorId'));
  }
  next();
});

// Método para agregar producto al carrito
cartSchema.methods.addItem = function(productId, quantity = 1) {
  const existingItem = this.items.find(item => 
    item.productId.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ productId, quantity });
  }

  return this.save();
};

// Método para remover producto del carrito
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => 
    item.productId.toString() !== productId.toString()
  );
  return this.save();
};

// Método para actualizar cantidad de un producto
cartSchema.methods.updateQuantity = function(productId, quantity) {
  const item = this.items.find(item => 
    item.productId.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }
    item.quantity = quantity;
    return this.save();
  }
  throw new Error('Producto no encontrado en el carrito');
};

// Método para limpiar el carrito
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Método para obtener el total de items
cartSchema.methods.getTotalItems = function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// Índices
cartSchema.index({ userId: 1 });
cartSchema.index({ visitorId: 1 });
cartSchema.index({ 'items.productId': 1 });

export default mongoose.model('Cart', cartSchema); 