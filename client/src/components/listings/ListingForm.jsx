import { useState } from 'react';

const CATEGORIES = ['textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'worn'];

export default function ListingForm({ initialValues = {}, onSubmit, submitLabel = 'Post listing' }) {
  const [form, setForm] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    price: initialValues.price || '',
    category: initialValues.category || 'other',
    condition: initialValues.condition || 'good',
    location: initialValues.location || '',
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setPhotoFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(form, photoFiles);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="listing-form">
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
        className="auth-input"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        rows={4}
        className="auth-input"
      />
      <div className="listing-form-row">
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Price ($)"
          value={form.price}
          onChange={handleChange}
          required
          className="auth-input"
        />
        <select name="category" value={form.category} onChange={handleChange} className="auth-input">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="listing-form-row">
        <select name="condition" value={form.condition} onChange={handleChange} className="auth-input">
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
        <input
          name="location"
          placeholder="Location (dorm/building)"
          value={form.location}
          onChange={handleChange}
          className="auth-input"
        />
      </div>
      <div>
        <label className="listing-form-label">Photos (up to 6)</label>
        <input type="file" accept="image/*" multiple onChange={handleFileChange} />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={submitting} className="auth-button">
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}