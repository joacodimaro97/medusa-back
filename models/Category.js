import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres'],
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'La descripción no puede tener más de 200 caracteres']
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Virtual para obtener el número de productos en la categoría
categorySchema.virtual('productCount').get(function() {
  return this.products ? this.products.length : 0;
});

// Método para agregar producto a la categoría
categorySchema.methods.addProduct = function(productId) {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
    return this.save();
  }
  return this;
};

// Método para remover producto de la categoría
categorySchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(id => id.toString() !== productId.toString());
  return this.save();
};

// Configurar para que los virtuals se incluyan en JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

// Índices (name ya tiene índice único automático)
categorySchema.index({ products: 1 });

export default mongoose.model('Category', categorySchema); 