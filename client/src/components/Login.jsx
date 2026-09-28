import { useState } from 'react';

export default function Login({ onLogin }) {
  const [name, setName] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onLogin(trimmed);
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <h1>Join the conversation</h1>
        <p>Pick a name so others know who's talking. No password needed.</p>
        <label htmlFor="username">Your name</label>
        <input
          id="username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          autoFocus
          autoComplete="off"
        />
        <button type="submit" disabled={!name.trim()}>Start chatting</button>
      </form>
    </div>
  );
}
