import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const thumbnail = listing.photos?.[0];
  const apiOrigin = import.meta.env.VITE_API_URL.replace('/api', '');

  return (
    <Link to={`/listings/${listing._id}`} className="listing-card">
      <div className="listing-card-image">
        {thumbnail ? (
          <img src={`${apiOrigin}${thumbnail}`} alt={listing.title} />
        ) : (
          <div className="listing-card-placeholder">No photo</div>
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