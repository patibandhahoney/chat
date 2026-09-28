import { useEffect, useRef } from 'react';

const time = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const day = (iso) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

export default function MessageList({ messages, username, typingUsers, loading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingUsers.length]);

  if (loading) return <div className="messages empty">Loading messages…</div>;
  if (!messages.length)
    return <div className="messages empty">No messages yet. Say hello!</div>;

  let lastDay = '';
  return (
    <div className="messages" role="log" aria-live="polite">
      {messages.map((m) => {
        const d = day(m.createdAt);
        const showDay = d !== lastDay;
        lastDay = d;
        const mine = m.username === username;
        return (
          <div key={m.id}>
            {showDay && <div className="day">{d}</div>}
            <div className={`msg ${mine ? 'mine' : ''}`}>
              {!mine && <span className="author">{m.username}</span>}
              <p>{m.text}</p>
              <time dateTime={m.createdAt}>{time(m.createdAt)}</time>
            </div>
          </div>
        );
      })}
      {typingUsers.length > 0 && (
        <div className="typing">
          {typingUsers.length === 1
            ? `${typingUsers[0]} is typing…`
            : `${typingUsers.join(', ')} are typing…`}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
