import Listing from '../models/Listing.js';
import { deleteListingPhotos } from '../utils/fileCleanup.js';


const CATEGORIES = Listing.schema.path('category').enumValues;
const CONDITIONS = Listing.schema.path('condition').enumValues;

const photoUrls = (files = []) => files.map((file) => `/uploads/listingss/${file.filename}`);

// lets parse the input stuff and validate. yayyyyyyyy
function parsePrice(value){
  if (typeof value !== 'string' && typeof value!== 'number') return null;
  if (value === '') return null;

  const n = Number(value);
  return Number.isFinite(n) && n>=0 ? n : null;
}

function listingFieldError({title, description, price, category, condition, location}){
  for (const text of [title, description, location]){
    if (text !== undefined && typeof text !== 'string'){
      return 'title, description and loca must be text';
    }
  }
  if (price !== undefined && parsePrice(price) === null){
    return 'price must be a number greater than zero. dont sell free stuff, thats a scam';
  }
  if (category !== undefined && !CATEGORIES.includes(category)){
    return `category must be one of these: ${CATEGORIES.join(', ')}`;
  }
  return null;
}

export async function createListing(req, res) {
  const { title, description, price, category, condition, location } = req.body;
  const photos = photoUrls(req.files);

  // if a reqq has been rejected, then del the saved photos
  const reject = async(message) => {
    await deleteListingPhotos(photos);
    return res.status(400).json({ error: message });
  };

  /// alllll the reasons to reject a request
  if (!title || price === undefined || price === '' || !category || !condition){
    return reject('title, price, category and condition are required fields');
  }
  const fieldError = listingFieldError(req.body);
  if (fieldError) return reject(fieldError);

  // passed the tests so create yada yada
  const listing = await Listing.create({
    seller: req.userId,
    title,
    description,
    price: parsePrice(price),
    category,
    condition,
    location,
    photos,
  });

  res.status(201).json({ listing });
}

export async function getListings(req, res) {
  
  const QUERY_PARAMS = ['category', 'condition', 'minPrice', 'maxPrice', 'q', 'sort', 'page', 'limit'];
  for (const key of QUERY_PARAMS){
    if (req.query[key] !== undefine && typeof req.query[key] !== 'string'){
      return res.status(400).json({ error: `Invalid ${key} parameter` });
    }
  }
  const { category, condition, minPrice, maxPrice, q, sort, page, limit } = req.query;

  const filter = { status: 'active' };
  if (category) filter.category = category;
  if (condition) filter.condition = condition;

  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;
  if (Number.isNaN(min) || Number.isNaN(max)){
    return res.status(400).json({ error: 'minPPrice and maxPrice must be numbers' });
  }
  if (min !== undefined || max !== undefined) {
    filter.price = {};
    if (min !== undefined) filter.price.$gte = min;
    if (max !== undefined) filter.price.$lte = max;
  }
  if (q) {
    filter.$text = { $search: q };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };
  const sortBy = Object.hasOwn(sortOptions, sort) ? sortOptions[sort] : sortOptions.newest;

  // garbage vals will fall back to defaults instead of becoming NaN
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

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

  const fieldError = listingFieldError(req.body);
  if (fieldError){
    await deleteListingPhotos(photoUrls(req.files));
    return res.status(400).json({ error: fieldError});
  }
  
  if (title !== undefined) listing.title = title;
  if (description !== undefined) listing.description = description;
  if (price !== undefined) listing.price = parsePrice(price);
  if (category !== undefined) listing.category = category;
  if (condition !== undefined) listing.condition = condition;
  if (location !== undefined) listing.location = location;

  // if new photos were uploaded, append them (keeps existing ones)
  if (req.files?.length) {
    listing.photos.push(...photoUrls(req.files));
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

  await deleteListingPhotos(listing.photos);
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