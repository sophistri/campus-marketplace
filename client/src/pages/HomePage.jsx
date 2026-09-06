import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../api/listings';
import ListingCard from '../components/listings/ListingCard';
import FilterBar from '../components/listings/FilterBar';

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ sort: 'newest' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      getListings({ ...filters, page: 1 })
        .then((data) => {
          setListings(data.listings);
          setPagination(data.pagination);
        })
        .finally(() => setLoading(false));
    }, 300); // debounce search typing

    return () => clearTimeout(timeout);
  }, [filters]);

  const loadPage = (page) => {
    setLoading(true);
    getListings({ ...filters, page })
      .then((data) => {
        setListings(data.listings);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse listings</h1>
        <Link to="/listings/new" className="button-primary">
          + New listing
        </Link>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <p className="auth-subtext">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="auth-subtext">No listings found.</p>
      ) : (
        <>
          <div className="listing-grid">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => loadPage(p)}
                  className={p === pagination.page ? 'page-button active' : 'page-button'}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}