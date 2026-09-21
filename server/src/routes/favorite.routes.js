import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/favorite.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, getFavorites);
router.post('/:listingId', authenticate, addFavorite);
router.delete('/:listingId', authenticate, removeFavorite);

export default router;