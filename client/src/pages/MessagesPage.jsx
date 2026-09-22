import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getConversations, getMessages, sendMessage as sendMessageApi } from '../api/conversations';

const POLL_INTERVAL_MS = 4000;

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('conversation') || null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const selectedConversation = conversations.find((c) => c._id === selectedId);

  // load the conversation list, then keep polling it
  useEffect(() => {
    let cancelled = false;

    const load = () => {
      getConversations().then((data) => {
        if (cancelled) return;
        setConversations(data);
        setLoading(false);
        // auto-select the first conversation (or one passed via ?conversation=) if none selected yet
        if (!selectedId && data.length > 0) {
          setSelectedId(data[0]._id);
        }
      });
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load + poll messages for whichever conversation is selected
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;

    const load = () => {
      getMessages(selectedId).then((data) => {
        if (!cancelled) setMessages(data);
      });
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return conversations;
    return conversations.filter((c) => {
      const otherName = getOtherPerson(c, user).name?.toLowerCase() || '';
      const listingTitle = c.listing?.title?.toLowerCase() || '';
      const lastText = c.lastMessage?.body?.toLowerCase() || '';
      return otherName.includes(value) || listingTitle.includes(value) || lastText.includes(value);
    });
  }, [conversations, search, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !selectedConversation) return;

    setMessageText('');
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      sender: user.id,
      body: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimisticMessage]);

    try {
      await sendMessageApi(selectedConversation._id, text);
    } catch {
      // remove the optimistic message if the send actually failed
      setMessages((current) => current.filter((m) => m._id !== optimisticMessage._id));
    }
  };

  if (loading) return <p className="auth-subtext page-container">Loading...</p>;

  return (
    <div className="messages-page">
      <div className="messages-header">
        <div>
          <h1>Messages</h1>
          <p>Chat with students about marketplace listings.</p>
        </div>
      </div>

      <div className="messages-layout">
        <section className="conversation-panel">
          <div className="conversation-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search messages"
            />
          </div>

          <div className="conversation-list">
            {filteredConversations.length === 0 ? (
              <div className="messages-empty-small">
                <strong>No conversations found</strong>
                <span>Message a seller from a listing to start one.</span>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const other = getOtherPerson(conversation, user);
                return (
                  <button
                    key={conversation._id}
                    type="button"
                    className={`conversation-item ${selectedId === conversation._id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(conversation._id)}
                  >
                    <span className="conversation-avatar">{other.name?.[0]?.toUpperCase() || '?'}</span>
                    <span className="conversation-content">
                      <span className="conversation-topline">
                        <strong>{other.name}</strong>
                        <small>{formatTime(conversation.lastMessage?.createdAt)}</small>
                      </span>
                      <span className="conversation-listing">{conversation.listing?.title}</span>
                      <span className="conversation-preview">
                        {conversation.lastMessage?.body || 'No messages yet'}
                      </span>
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </section>

        {selectedConversation ? (
          <section className="chat-panel">
            <header className="chat-header">
              <div className="chat-person">
                <span className="chat-avatar">
                  {getOtherPerson(selectedConversation, user).name?.[0]?.toUpperCase() || '?'}
                </span>
                <div>
                  <h2>{getOtherPerson(selectedConversation, user).name}</h2>
                  <span>Campus Marketplace student</span>
                </div>
              </div>
            </header>

            <div className="listing-preview">
              <div className="listing-preview-icon">▣</div>
              <div>
                <span>Interested in</span>
                <strong>{selectedConversation.listing?.title}</strong>
              </div>
              <strong className="listing-preview-price">${selectedConversation.listing?.price}</strong>
            </div>

            <div className="chat-messages">
              {messages.map((item) => (
                <div
                  key={item._id}
                  className={`message-row ${item.sender === user.id ? 'me' : 'them'}`}
                >
                  <div className="message-bubble">
                    <span>{item.body}</span>
                    <small>{formatTime(item.createdAt)}</small>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-composer" onSubmit={handleSend}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                aria-label="Type a message"
              />
              <button type="submit" disabled={!messageText.trim()}>
                Send
              </button>
            </form>
          </section>
        ) : (
          <section className="chat-panel chat-no-selection">
            <div>
              <div className="empty-chat-icon">💬</div>
              <h2>Select a conversation</h2>
              <p>Choose a conversation to start chatting.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// a conversation only stores buyer + seller — figure out which one isn't "me"
function getOtherPerson(conversation, user) {
  if (!conversation || !user) return {};
  return conversation.buyer?._id === user.id ? conversation.seller : conversation.buyer;
}

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}