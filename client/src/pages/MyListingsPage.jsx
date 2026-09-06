import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyListings, updateListingStatus, deleteListing } from '../api/listings';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = () => {
    setLoading(true);
    getMyListings()
      .then(setListings)
      .finally(() => setLoading(false));
  };

  const handleMarkSold = async (id) => {
    await updateListingStatus(id, 'sold');
    loadListings();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    await deleteListing(id);
    loadListings();
  };

  if (loading) return <p className="auth-subtext page-container">Loading...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My listings</h1>
        <Link to="/listings/new" className="button-primary">+ New listing</Link>
      </div>

      {listings.length === 0 ? (
        <p className="auth-subtext">You haven't posted any listings yet.</p>
      ) : (
        <div className="my-listings-list">
          {listings.map((listing) => (
            <div key={listing._id} className="my-listing-row">
              <Link to={`/listings/${listing._id}`} className="my-listing-title">
                {listing.title}
              </Link>
              <span className="listing-card-meta">{listing.status}</span>
              <span>${listing.price}</span>
              <div className="my-listing-actions">
                {listing.status === 'active' && (
                  <button onClick={() => handleMarkSold(listing._id)} className="auth-link-button">
                    Mark sold
                  </button>
                )}
                <button onClick={() => handleDelete(listing._id)} className="auth-link-button">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}