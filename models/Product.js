import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  discount: {
    type: Number,
    min: [0, 'El descuento no puede ser negativo'],
    max: [100, 'El descuento no puede ser mayor al 100%'],
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La categoría es requerida']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Las URLs de imágenes deben ser válidas'
    }
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual para calcular el precio con descuento
productSchema.virtual('finalPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual para verificar si hay stock disponible
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual para calcular el rating promedio
productSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  return this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
});

// Virtual para obtener el número total de reviews
productSchema.virtual('totalReviews').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

// Método para aplicar descuento
productSchema.methods.applyDiscount = function(discountPercentage) {
  if (discountPercentage >= 0 && discountPercentage <= 100) {
    this.discount = discountPercentage;
    return this.save();
  }
  throw new Error('El descuento debe estar entre 0 y 100');
};

// Método para actualizar stock
productSchema.methods.updateStock = function(quantity) {
  this.stock = Math.max(0, this.stock + quantity);
  return this.save();
};

// Método para verificar disponibilidad
productSchema.methods.isAvailable = function(quantity = 1) {
  return this.stock >= quantity;
};

// Método para agregar review
productSchema.methods.addReview = function(reviewId) {
  if (!this.reviews.includes(reviewId)) {
    this.reviews.push(reviewId);
    return this.save();
  }
  return this;
};

// Método para remover review
productSchema.methods.removeReview = function(reviewId) {
  this.reviews = this.reviews.filter(id => id.toString() !== reviewId.toString());
  return this.save();
};

// Configurar para que los virtuals se incluyan en JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Índices para mejorar el rendimiento de las consultas
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ discount: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ reviews: 1 });

export default mongoose.model('Product', productSchema); 