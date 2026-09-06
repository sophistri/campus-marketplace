import client, { setAccessToken } from './client';

export async function signup({ email, password, name, campus }) {
  const { data } = await client.post('/auth/signup', { email, password, name, campus });
  return data;
}

export async function verifyEmail(token) {
  const { data } = await client.post('/auth/verify-email', { token });
  return data;
}

export async function resendVerification(email) {
  const { data } = await client.post('/auth/resend-verification', { email });
  return data;
}

export async function login({ email, password }) {
  const { data } = await client.post('/auth/login', { email, password });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logout() {
  await client.post('/auth/logout');
  setAccessToken(null);
}

export async function fetchMe() {
  const { data } = await client.get('/auth/me');
  return data.user;
}

export async function tryRefresh() {
  const { data } = await client.post('/auth/refresh');
  setAccessToken(data.accessToken);
  return data.accessToken;
}