import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El ID del producto es requerido']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es requerido']
  },
  rating: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  comment: {
    type: String,
    required: [true, 'El comentario es requerido'],
    trim: true,
    maxlength: [500, 'El comentario no puede tener más de 500 caracteres']
  }
}, {
  timestamps: { 
    createdAt: true, 
    updatedAt: false 
  }
});

// Middleware para mantener relaciones sincronizadas
reviewSchema.post('save', async function() {
  try {
    const Product = mongoose.model('Product');
    const User = mongoose.model('User');
    
    // Agregar review al producto
    await Product.findByIdAndUpdate(
      this.productId,
      { $addToSet: { reviews: this._id } }
    );
    
    // Agregar review al usuario
    await User.findByIdAndUpdate(
      this.userId,
      { $addToSet: { reviews: this._id } }
    );
  } catch (error) {
    console.error('Error sincronizando relaciones de review:', error);
  }
});

reviewSchema.post('remove', async function() {
  try {
    const Product = mongoose.model('Product');
    const User = mongoose.model('User');
    
    // Remover review del producto
    await Product.findByIdAndUpdate(
      this.productId,
      { $pull: { reviews: this._id } }
    );
    
    // Remover review del usuario
    await User.findByIdAndUpdate(
      this.userId,
      { $pull: { reviews: this._id } }
    );
  } catch (error) {
    console.error('Error sincronizando relaciones de review:', error);
  }
});

// Validación: un usuario solo puede hacer una review por producto
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Índices adicionales
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model('Review', reviewSchema); 