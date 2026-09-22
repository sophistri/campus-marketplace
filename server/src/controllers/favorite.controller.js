import Favorite from '../models/Favorite.js';
import Listing from '../models/Listing.js';

export async function addFavorite(req, res) {
  const { listingId } = req.params;

  const listing = await Listing.findById(listingId);

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  try {
    const favorite = await Favorite.create({
      user: req.userId,
      listing: listingId,
    });

    res.status(201).json({ favorite });
  } catch (error) {
    // The unique index prevents the same user from
    // favoriting the same listing more than once.
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Listing already favorited' });
    }

    throw error;
  }
}

export async function removeFavorite(req, res) {
  const { listingId } = req.params;

  const favorite = await Favorite.findOneAndDelete({
    user: req.userId,
    listing: listingId,
  });

  if (!favorite) {
    return res.status(404).json({ error: 'Favorite not found' });
  }

  res.json({ message: 'Favorite removed' });
}

export async function getFavorites(req, res) {
  const favorites = await Favorite.find({
    user: req.userId,
  })
    .sort({ createdAt: -1 })
    .populate('listing');

  res.json({ favorites });
}