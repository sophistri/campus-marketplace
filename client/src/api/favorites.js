import client from './client';

export async function getFavorites() {
  const { data } = await client.get('/favorites');
  return data.favorites;
}

export async function addFavorite(listingId) {
  const { data } = await client.post(`/favorites/${listingId}`);
  return data.favorite;
}

export async function removeFavorite(listingId) {
  await client.delete(`/favorites/${listingId}`);
}