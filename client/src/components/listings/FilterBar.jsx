const CATEGORIES = ['textbooks', 'electronics', 'furniture', 'clothing', 'other'];

export default function FilterBar({ filters, onChange }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="filter-bar">
      <input
        type="text"
        name="q"
        placeholder="Search listings..."
        value={filters.q || ''}
        onChange={handleChange}
        className="filter-input filter-search"
      />
      <select name="category" value={filters.category || ''} onChange={handleChange} className="filter-input">
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c[0].toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="minPrice"
        placeholder="Min $"
        value={filters.minPrice || ''}
        onChange={handleChange}
        className="filter-input filter-price"
      />
      <input
        type="number"
        name="maxPrice"
        placeholder="Max $"
        value={filters.maxPrice || ''}
        onChange={handleChange}
        className="filter-input filter-price"
      />
      <select name="sort" value={filters.sort || 'newest'} onChange={handleChange} className="filter-input">
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}