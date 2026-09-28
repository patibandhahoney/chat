import { useState } from 'react';

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const ok = await onSend(trimmed);
    if (ok) setText('');
    setSending(false);
  };

  return (
    <form className="composer" onSubmit={submit}>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onTyping();
        }}
        placeholder="Write a message"
        maxLength={1000}
        aria-label="Message"
        autoComplete="off"
      />
      <button type="submit" disabled={!text.trim() || sending}>Send</button>
    </form>
  );
}
