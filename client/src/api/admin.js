import client from './client';

export async function getStats() {
  const { data } = await client.get('/admin/stats');
  return data;
}

export async function getUsers() {
  const { data } = await client.get('/admin/users');
  return data.users;
}

export async function setUserSuspension(userId, suspended) {
  const { data } = await client.patch(`/admin/users/${userId}/suspend`, { suspended });
  return data.user;
}

export async function getAllListings(status) {
  const { data } = await client.get('/admin/listings', { params: status ? { status } : {} });
  return data.listings;
}

export async function forceUpdateListingStatus(listingId, status) {
  const { data } = await client.patch(`/admin/listings/${listingId}/status`, { status });
  return data.listing;
}

export async function forceDeleteListing(listingId) {
  await client.delete(`/admin/listings/${listingId}`);
}

export async function getReports(status) {
  const { data } = await client.get('/admin/reports', { params: status ? { status } : {} });
  return data.reports;
}

export async function updateReportStatus(reportId, status) {
  const { data } = await client.patch(`/admin/reports/${reportId}`, { status });
  return data.report;
}