import client from './client';

export async function getListings(params = {}) {
  const { data } = await client.get('/listings', { params });
  return data; // { listings, pagination }
}

export async function getListing(id) {
  const { data } = await client.get(`/listings/${id}`);
  return data.listing;
}

export async function getMyListings() {
  const { data } = await client.get('/listings/mine');
  return data.listings;
}

export async function createListing(formValues, photoFiles) {
  const formData = new FormData();
  Object.entries(formValues).forEach(([key, value]) => {
    if (value !== undefined && value !== '') formData.append(key, value);
  });
  photoFiles.forEach((file) => formData.append('photos', file));

  const { data } = await client.post('/listings', formData);
  return data.listing;
}

export async function updateListing(id, formValues, photoFiles = []) {
  const formData = new FormData();
  Object.entries(formValues).forEach(([key, value]) => {
    if (value !== undefined && value !== '') formData.append(key, value);
  });
  photoFiles.forEach((file) => formData.append('photos', file));

  const { data } = await client.patch(`/listings/${id}`, formData);
  return data.listing;
}

export async function updateListingStatus(id, status) {
  const { data } = await client.patch(`/listings/${id}/status`, { status });
  return data.listing;
}

export async function deleteListing(id) {
  await client.delete(`/listings/${id}`);
}