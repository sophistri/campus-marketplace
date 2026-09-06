import Listing from '../models/Listing.js';

export async function createListing(req, res) {
  const { title, description, price, category, condition, location } = req.body;

  if (!title || !price || !category || !condition) {
    return res.status(400).json({ error: 'title, price, category, and condition are required' });
  }

  const photos = (req.files || []).map((file) => `/uploads/listings/${file.filename}`);

  const listing = await Listing.create({
    seller: req.userId,
    title,
    description,
    price,
    category,
    condition,
    location,
    photos,
  });

  res.status(201).json({ listing });
}

export async function getListings(req, res) {
  const { category, condition, minPrice, maxPrice, q, sort, page = 1, limit = 20 } = req.query;

  const filter = { status: 'active' };
  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) {
    filter.$text = { $search: q };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.newest;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit), 50);

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort(sortBy)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('seller', 'name campus'),
    Listing.countDocuments(filter),
  ]);

  res.json({
    listings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function getListingById(req, res) {
  const listing = await Listing.findById(req.params.id).populate('seller', 'name campus avatarUrl');
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  res.json({ listing });
}

export async function updateListing(req, res) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (listing.seller.toString() !== req.userId) {
    return res.status(403).json({ error: 'You can only edit your own listings' });
  }

  const { title, description, price, category, condition, location } = req.body;
  if (title !== undefined) listing.title = title;
  if (description !== undefined) listing.description = description;
  if (price !== undefined) listing.price = price;
  if (category !== undefined) listing.category = category;
  if (condition !== undefined) listing.condition = condition;
  if (location !== undefined) listing.location = location;

  // if new photos were uploaded, append them (keeps existing ones)
  if (req.files?.length) {
    const newPhotos = req.files.map((file) => `/uploads/listings/${file.filename}`);
    listing.photos.push(...newPhotos);
  }

  await listing.save();
  res.json({ listing });
}

export async function deleteListing(req, res) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (listing.seller.toString() !== req.userId) {
    return res.status(403).json({ error: 'You can only delete your own listings' });
  }

  await listing.deleteOne();
  res.json({ message: 'Listing deleted' });
}

export async function updateListingStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['active', 'pending', 'sold', 'removed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (listing.seller.toString() !== req.userId) {
    return res.status(403).json({ error: 'You can only update your own listings' });
  }

  listing.status = status;
  await listing.save();
  res.json({ listing });
}

export async function getMyListings(req, res) {
  const listings = await Listing.find({ seller: req.userId }).sort({ createdAt: -1 });
  res.json({ listings });
}