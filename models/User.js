import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'El teléfono no puede tener más de 20 caracteres']
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'La calle no puede tener más de 100 caracteres']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'La ciudad no puede tener más de 50 caracteres']
    },
    province: {
      type: String,
      trim: true,
      maxlength: [50, 'La provincia no puede tener más de 50 caracteres']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'El país no puede tener más de 50 caracteres']
    },
    zip: {
      type: String,
      trim: true,
      maxlength: [10, 'El código postal no puede tener más de 10 caracteres']
    }
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Esto agrega createdAt y updatedAt automáticamente
});

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos del usuario sin la contraseña
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Método para agregar producto a favoritos
userSchema.methods.addToFavorites = async function(productId) {
  if (!this.favorites.includes(productId)) {
    this.favorites.push(productId);
    await this.save();
  }
  return this;
};

// Método para remover producto de favoritos
userSchema.methods.removeFromFavorites = async function(productId) {
  this.favorites = this.favorites.filter(id => id.toString() !== productId.toString());
  await this.save();
  return this;
};

// Método para agregar orden al historial
userSchema.methods.addOrder = async function(orderId) {
  if (!this.orders.includes(orderId)) {
    this.orders.push(orderId);
    await this.save();
  }
  return this;
};

// Método para agregar review al historial
userSchema.methods.addReview = async function(reviewId) {
  if (!this.reviews.includes(reviewId)) {
    this.reviews.push(reviewId);
    await this.save();
  }
  return this;
};

// Virtual para obtener el número total de pedidos
userSchema.virtual('totalOrders').get(function() {
  return this.orders ? this.orders.length : 0;
});

// Virtual para obtener el número total de reviews
userSchema.virtual('totalReviews').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

// Virtual para obtener el número total de favoritos
userSchema.virtual('totalFavorites').get(function() {
  return this.favorites ? this.favorites.length : 0;
});

// Configurar para que los virtuals se incluyan en JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Índices (email ya tiene índice único automático)
userSchema.index({ isAdmin: 1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ 'address.country': 1 });
userSchema.index({ orders: 1 });
userSchema.index({ reviews: 1 });

export default mongoose.model('User', userSchema); 