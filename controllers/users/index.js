// Auth Controller
export { createUser } from './authController.js';

// Profile Controller
export { 
  getProfile, 
  updateProfile, 
  changePassword 
} from './profileController.js';

// Admin Controller
export { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from './adminController.js';

// Favorites Controller
export { 
  getFavorites, 
  addToFavorites, 
  removeFromFavorites 
} from './favoritesController.js'; 