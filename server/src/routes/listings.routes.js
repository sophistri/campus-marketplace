import { Router } from 'express';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  updateListingStatus,
  getMyListings,
} from '../controllers/listings.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadListingPhotos } from '../config/upload.js';
import { validateObjectIdParam } from '../middleware/validateObjectId.js';

const router = Router();
router.param('id', validateObjectIdParam); // malformed ids get a 400 before any controller runs

router.get('/', getListings);
router.get('/mine', authenticate, getMyListings);
router.get('/:id', getListingById);

router.post('/', authenticate, uploadListingPhotos.array('photos', 6), createListing);
router.patch('/:id', authenticate, uploadListingPhotos.array('photos', 6), updateListing);
router.patch('/:id/status', authenticate, updateListingStatus);
router.delete('/:id', authenticate, deleteListing);

export default router;