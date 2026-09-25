import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Report from '../models/Report.js';
import { deleteListingPhotos } from '../utils/fileCleanup.js';

// ---- Users ----

// GET /api/admin/users
export async function getUsers(req, res) {
  const users = await User.find()
    .select('-passwordHash -refreshTokenHash -verificationToken')
    .sort({ createdAt: -1 });
  res.json({ users });
}

// PATCH /api/admin/users/:id/suspend  { suspended: true | false }
export async function setUserSuspension(req, res) {
  const { suspended } = req.body;

  if (typeof suspended !== 'boolean') {
    return res.status(400).json({ error: 'suspended must be true or false' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // don't let an admin accidentally suspend themselves and get locked out
  if (user._id.toString() === req.userId && suspended) {
    return res.status(400).json({ error: "You can't suspend your own account" });
  }

  user.isSuspended = suspended;
  await user.save();

  res.json({ user: { id: user._id, email: user.email, isSuspended: user.isSuspended } });
}

// ---- Listings ----

// GET /api/admin/listings — every listing, any status, unlike the public browse endpoint
export async function getAllListings(req, res) {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const listings = await Listing.find(filter)
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });

  res.json({ listings });
}

// PATCH /api/admin/listings/:id/status — force a status change, bypassing ownership checks
export async function forceUpdateListingStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['active', 'pending', 'sold', 'removed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  listing.status = status;
  await listing.save();

  res.json({ listing });
}

// DELETE /api/admin/listings/:id — force delete, bypassing ownership checks
export async function forceDeleteListing(req, res) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  await deleteListingPhotos(listing.photos);
  await listing.deleteOne();

  res.json({ message: 'Listing deleted by admin' });
}

// ---- Reports ----

// GET /api/admin/reports?status=open
export async function getReports(req, res) {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const reports = await Report.find(filter)
    .populate('reporter', 'name email')
    .sort({ createdAt: -1 });

  res.json({ reports });
}

// PATCH /api/admin/reports/:id  { status: 'reviewed' | 'dismissed' }
export async function updateReportStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['open', 'reviewed', 'dismissed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.status = status;
  await report.save();

  res.json({ report });
}

// ---- Overview stats — a quick snapshot for the dashboard landing view ----

// GET /api/admin/stats
export async function getStats(req, res) {
  const [totalUsers, suspendedUsers, activeListings, openReports] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isSuspended: true }),
    Listing.countDocuments({ status: 'active' }),
    Report.countDocuments({ status: 'open' }),
  ]);

  res.json({ totalUsers, suspendedUsers, activeListings, openReports });
}