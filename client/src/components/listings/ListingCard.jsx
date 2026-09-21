import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../../api/favorites';

export default function ListingCard({
  listing,
  initiallyFavorite = false,
  onFavoriteChange,
}) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initiallyFavorite);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
  async function checkFavorite() {
    if (!user || initiallyFavorite) return;

    try {
      const favorites = await getFavorites();

      const alreadyFavorite = favorites.some(
        (favorite) => favorite.listing?._id === listing._id
      );

      setIsFavorite(alreadyFavorite);
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  }

  checkFavorite();
}, [user, listing._id, initiallyFavorite]);

  const thumbnail = listing.photos?.[0];
  const apiOrigin = import.meta.env.VITE_API_URL.replace('/api', '');

  const handleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user || favoriteLoading) return;

    try {
      setFavoriteLoading(true);

if (isFavorite) {
  await removeFavorite(listing._id);
  setIsFavorite(false);
  onFavoriteChange?.(false);
} else {
  await addFavorite(listing._id);
  setIsFavorite(true);
  onFavoriteChange?.(true);
}
    } catch (error) {
      console.error('Failed to update favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Link to={`/listings/${listing._id}`} className="listing-card">
      <div
  className="listing-card-image"
  style={{ position: 'relative' }}
>
        {thumbnail ? (
          <img src={`${apiOrigin}${thumbnail}`} alt={listing.title} />
        ) : (
          <div className="listing-card-placeholder">No photo</div>
        )}

        {user && (
<button
  type="button"
  className="favorite-button"
  onClick={handleFavorite}
  disabled={favoriteLoading}
  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
  style={{
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: '50%',
    background: 'white',
    color: '#555',
    fontSize: '22px',
    lineHeight: '36px',
    textAlign: 'center',
    cursor: 'pointer',
    zIndex: 2,
  }}
>
  {isFavorite ? '♥' : '♡'}
</button>
        )}
      </div>

      <div className="listing-card-body">
        <p className="listing-card-price">${listing.price}</p>
        <p className="listing-card-title">{listing.title}</p>
        <p className="listing-card-meta">{listing.condition.replace('_', ' ')}</p>
      </div>
    </Link>
  );
}