import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListing, deleteListing, updateListingStatus } from '../api/listings';
import { useAuth } from '../hooks/useAuth';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiOrigin = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    getListing(id)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="auth-subtext page-container">Loading...</p>;
  if (!listing) return <p className="auth-error page-container">Listing not found.</p>;

  const isOwner = user && listing.seller?._id === user.id;

  const handleDelete = async () => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    await deleteListing(id);
    navigate('/');
  };

  const handleMarkSold = async () => {
    const updated = await updateListingStatus(id, 'sold');
    setListing(updated);
  };

  return (
    <div className="page-container listing-detail">
      <div className="listing-detail-photos">
        {listing.photos?.length ? (
          listing.photos.map((photo) => (
            <img key={photo} src={`${apiOrigin}${photo}`} alt={listing.title} />
          ))
        ) : (
          <div className="listing-card-placeholder">No photos</div>
        )}
      </div>

      <div className="listing-detail-info">
        <h1>{listing.title}</h1>
        <p className="listing-detail-price">${listing.price}</p>
        <p className="listing-detail-meta">
          {listing.category} · {listing.condition.replace('_', ' ')}
          {listing.location && ` · ${listing.location}`}
        </p>
        {listing.status !== 'active' && (
          <p className="auth-error">Status: {listing.status}</p>
        )}
        <p>{listing.description}</p>
        <p className="auth-subtext">Seller: {listing.seller?.name}</p>

        {isOwner ? (
          <div className="listing-detail-actions">
            {listing.status === 'active' && (
              <button onClick={handleMarkSold} className="auth-button">Mark as sold</button>
            )}
            <button onClick={handleDelete} className="auth-link-button">Delete listing</button>
          </div>
        ) : (
          <button className="auth-button">Message seller</button>
        )}
      </div>
    </div>
  );
}