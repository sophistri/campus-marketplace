import client from './client';

export async function getConversations() {
  const { data } = await client.get('/conversations');
  return data.conversations;
}

export async function startConversation(listingId) {
  const { data } = await client.post('/conversations', { listingId });
  return data.conversation;
}

export async function getMessages(conversationId) {
  const { data } = await client.get(`/conversations/${conversationId}/messages`);
  return data.messages;
}

export async function sendMessage(conversationId, body) {
  const { data } = await client.post(`/conversations/${conversationId}/messages`, { body });
  return data.message;
}