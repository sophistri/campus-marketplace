import { useMemo, useState } from 'react';

const initialConversations = [
  {
    id: 1,
    name: 'Arjun',
    avatar: 'A',
    listing: 'Scientific Calculator',
    price: '₹500',
    lastMessage: 'Yes! It is still available.',
    time: '10:21 AM',
    unread: 2,
    messages: [
      { id: 1, sender: 'them', text: 'Hey, is this calculator still available?', time: '10:20 AM' },
      { id: 2, sender: 'me', text: 'Yes! It is still available.', time: '10:21 AM' },
      { id: 3, sender: 'them', text: 'Can you do ₹500?', time: '10:22 AM' },
    ],
  },
  {
    id: 2,
    name: 'Rahul',
    avatar: 'R',
    listing: 'Engineering Mathematics Book',
    price: '₹300',
    lastMessage: 'Can you reduce the price?',
    time: 'Yesterday',
    unread: 1,
    messages: [
      { id: 1, sender: 'them', text: 'Hi, is the mathematics book available?', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Yes, I still have it.', time: 'Yesterday' },
      { id: 3, sender: 'them', text: 'Can you reduce the price?', time: 'Yesterday' },
    ],
  },
  {
    id: 3,
    name: 'Ananya',
    avatar: 'A',
    listing: 'Study Table',
    price: '₹1,200',
    lastMessage: 'Okay, tomorrow works for me.',
    time: 'Mon',
    unread: 0,
    messages: [
      { id: 1, sender: 'me', text: 'Are you still interested in the study table?', time: 'Mon' },
      { id: 2, sender: 'them', text: 'Yes, when can I come to see it?', time: 'Mon' },
      { id: 3, sender: 'me', text: 'Tomorrow afternoon should work.', time: 'Mon' },
      { id: 4, sender: 'them', text: 'Okay, tomorrow works for me.', time: 'Mon' },
    ],
  },
  {
    id: 4,
    name: 'Vishnu',
    avatar: 'V',
    listing: 'USB Keyboard',
    price: '₹400',
    lastMessage: 'Thanks!',
    time: 'Sun',
    unread: 0,
    messages: [
      { id: 1, sender: 'them', text: 'Is the keyboard in good condition?', time: 'Sun' },
      { id: 2, sender: 'me', text: 'Yes, everything works perfectly.', time: 'Sun' },
      { id: 3, sender: 'them', text: 'Thanks!', time: 'Sun' },
    ],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId);

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return conversations;

    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(value) ||
        conversation.listing.toLowerCase().includes(value) ||
        conversation.lastMessage.toLowerCase().includes(value)
    );
  }, [conversations, search]);

  const selectConversation = (id) => {
    setSelectedId(id);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation
      )
    );
  };

  const sendMessage = (event) => {
    event.preventDefault();

    const text = message.trim();
    if (!text || !selectedConversation) return;

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== selectedConversation.id) return conversation;

        return {
          ...conversation,
          lastMessage: text,
          time: 'Now',
          messages: [
            ...conversation.messages,
            {
              id: Date.now(),
              sender: 'me',
              text,
              time: 'Now',
            },
          ],
        };
      })
    );

    setMessage('');
  };

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
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search messages"
            />
          </div>

          <div className="conversation-list">
            {filteredConversations.length === 0 ? (
              <div className="messages-empty-small">
                <strong>No conversations found</strong>
                <span>Try a different search.</span>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`conversation-item ${
                    selectedId === conversation.id ? 'selected' : ''
                  }`}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <span className="conversation-avatar">{conversation.avatar}</span>

                  <span className="conversation-content">
                    <span className="conversation-topline">
                      <strong>{conversation.name}</strong>
                      <small>{conversation.time}</small>
                    </span>
                    <span className="conversation-listing">{conversation.listing}</span>
                    <span className="conversation-preview">{conversation.lastMessage}</span>
                  </span>

                  {conversation.unread > 0 && (
                    <span className="unread-badge">{conversation.unread}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </section>

        {selectedConversation ? (
          <section className="chat-panel">
            <header className="chat-header">
              <div className="chat-person">
                <span className="chat-avatar">{selectedConversation.avatar}</span>
                <div>
                  <h2>{selectedConversation.name}</h2>
                  <span>Campus Marketplace student</span>
                </div>
              </div>

              <div className="chat-actions">
                <button type="button" title="More options" aria-label="More options">
                  ⋮
                </button>
              </div>
            </header>

            <div className="listing-preview">
              <div className="listing-preview-icon">▣</div>
              <div>
                <span>Interested in</span>
                <strong>{selectedConversation.listing}</strong>
              </div>
              <strong className="listing-preview-price">{selectedConversation.price}</strong>
            </div>

            <div className="chat-messages">
              <div className="chat-date">Today</div>

              {selectedConversation.messages.map((item) => (
                <div key={item.id} className={`message-row ${item.sender}`}>
                  <div className="message-bubble">
                    <span>{item.text}</span>
                    <small>{item.time}</small>
                  </div>
                </div>
              ))}
            </div>

            <form className="message-composer" onSubmit={sendMessage}>
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type a message..."
                aria-label="Type a message"
              />
              <button type="submit" disabled={!message.trim()}>
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
