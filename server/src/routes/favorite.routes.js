import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/favorite.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateObjectIdParam } from '../middleware/validateObjectId.js';

const router = Router();
router.param('listingId', validateObjectIdParam); // malformed ids get a 400 before any controller runs

router.get('/', authenticate, getFavorites);
router.post('/:listingId', authenticate, addFavorite);
router.delete('/:listingId', authenticate, removeFavorite);

export default router;