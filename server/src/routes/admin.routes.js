import { Router } from 'express';
import {
  getUsers,
  setUserSuspension,
  getAllListings,
  forceUpdateListingStatus,
  forceDeleteListing,
  getReports,
  updateReportStatus,
  getStats,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// every admin route requires both: a valid login AND the admin role
router.use(authenticate, requireAdmin);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.patch('/users/:id/suspend', setUserSuspension);

router.get('/listings', getAllListings);
router.patch('/listings/:id/status', forceUpdateListingStatus);
router.delete('/listings/:id', forceDeleteListing);

router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

export default router;