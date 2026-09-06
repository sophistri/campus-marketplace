import { useNavigate } from 'react-router-dom';
import ListingForm from '../components/listings/ListingForm';
import { createListing } from '../api/listings';

export default function CreateListingPage() {
  const navigate = useNavigate();

  const handleSubmit = async (formValues, photoFiles) => {
    const listing = await createListing(formValues, photoFiles);
    navigate(`/listings/${listing._id}`);
  };

  return (
    <div className="page-container">
      <h1>New listing</h1>
      <ListingForm onSubmit={handleSubmit} submitLabel="Post listing" />
    </div>
  );
}