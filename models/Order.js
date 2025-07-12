import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El ID del producto es requerido']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [1, 'La cantidad debe ser al menos 1']
  },
  priceAtPurchase: {
    type: Number,
    required: [true, 'El precio al momento de la compra es requerido'],
    min: [0, 'El precio no puede ser negativo']
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'La calle es requerida'],
    trim: true,
    maxlength: [100, 'La calle no puede tener más de 100 caracteres']
  },
  city: {
    type: String,
    required: [true, 'La ciudad es requerida'],
    trim: true,
    maxlength: [50, 'La ciudad no puede tener más de 50 caracteres']
  },
  province: {
    type: String,
    required: [true, 'La provincia es requerida'],
    trim: true,
    maxlength: [50, 'La provincia no puede tener más de 50 caracteres']
  },
  country: {
    type: String,
    required: [true, 'El país es requerido'],
    trim: true,
    maxlength: [50, 'El país no puede tener más de 50 caracteres']
  },
  zip: {
    type: String,
    required: [true, 'El código postal es requerido'],
    trim: true,
    maxlength: [10, 'El código postal no puede tener más de 10 caracteres']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'La dirección de envío es requerida']
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: [true, 'El total es requerido'],
    min: [0, 'El total no puede ser negativo']
  },
  paymentStatus: {
    type: String,
    required: [true, 'El estado del pago es requerido'],
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentProvider: {
    type: String,
    required: [true, 'El proveedor de pago es requerido'],
    trim: true
  },
  shippingStatus: {
    type: String,
    required: [true, 'El estado del envío es requerido'],
    enum: ['pending', 'shipped', 'delivered'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Middleware para mantener relaciones sincronizadas
orderSchema.post('save', async function() {
  try {
    if (this.userId) {
      const User = mongoose.model('User');
      // Agregar orden al usuario
      await User.findByIdAndUpdate(
        this.userId,
        { $addToSet: { orders: this._id } }
      );
    }
  } catch (error) {
    console.error('Error sincronizando relaciones de order:', error);
  }
});

orderSchema.post('remove', async function() {
  try {
    if (this.userId) {
      const User = mongoose.model('User');
      // Remover orden del usuario
      await User.findByIdAndUpdate(
        this.userId,
        { $pull: { orders: this._id } }
      );
    }
  } catch (error) {
    console.error('Error sincronizando relaciones de order:', error);
  }
});

// Virtual para calcular el total de items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual para verificar si el pedido está pagado
orderSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'paid';
});

// Virtual para verificar si el pedido está enviado
orderSchema.virtual('isShipped').get(function() {
  return this.shippingStatus === 'shipped' || this.shippingStatus === 'delivered';
});

// Virtual para verificar si el pedido está entregado
orderSchema.virtual('isDelivered').get(function() {
  return this.shippingStatus === 'delivered';
});

// Método para actualizar estado de pago
orderSchema.methods.updatePaymentStatus = function(status) {
  if (['pending', 'paid', 'failed'].includes(status)) {
    this.paymentStatus = status;
    return this.save();
  }
  throw new Error('Estado de pago inválido');
};

// Método para actualizar estado de envío
orderSchema.methods.updateShippingStatus = function(status) {
  if (['pending', 'shipped', 'delivered'].includes(status)) {
    this.shippingStatus = status;
    return this.save();
  }
  throw new Error('Estado de envío inválido');
};

// Método para calcular el total del pedido
orderSchema.methods.calculateTotal = function() {
  this.total = this.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
  return this.save();
};

// Configurar para que los virtuals se incluyan en JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Índices
orderSchema.index({ userId: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ shippingStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.country': 1 });
orderSchema.index({ 'shippingAddress.city': 1 });

// Plugin de paginación
orderSchema.plugin(mongoosePaginate);

export default mongoose.model('Order', orderSchema); 