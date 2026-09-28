import { useState } from 'react';
import Login from './components/Login';
import ChatWindow from './components/ChatWindow';

const KEY = 'chat.username';
const read = () => {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
};

export default function App() {
  const [username, setUsername] = useState(read);

  const login = (name) => {
    try { localStorage.setItem(KEY, name); } catch { /* ignore */ }
    setUsername(name);
  };
  const logout = () => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    setUsername('');
  };

  return username ? <ChatWindow username={username} onLogout={logout} /> : <Login onLogin={login} />;
}
