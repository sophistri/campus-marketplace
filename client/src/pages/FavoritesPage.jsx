import { useEffect, useState } from 'react';
import { getFavorites } from '../api/favorites';
import ListingCard from '../components/listings/ListingCard';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await getFavorites();
        setFavorites(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  if (loading) {
    return <div className="page-container">Loading favorites...</div>;
  }

  if (error) {
    return <div className="page-container">{error}</div>;
  }

  return (
    <div className="page-container">
      <h1>Favorites</h1>

      {favorites.length === 0 ? (
        <p>You haven't added any favorites yet.</p>
      ) : (
        <div className="listing-grid">
          {favorites.map((favorite) => (
<ListingCard
  key={favorite._id}
  listing={favorite.listing}
  initiallyFavorite={true}
  onFavoriteChange={(isFavorite) => {
    if (!isFavorite) {
      setFavorites((current) =>
        current.filter((item) => item._id !== favorite._id)
      );
    }
  }}
/>
          ))}
        </div>
      )}
    </div>
  );
}