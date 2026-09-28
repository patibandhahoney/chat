import useChat from '../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';

export default function ChatWindow({ username, onLogout }) {
  const { messages, onlineUsers, typingUsers, connected, error, loading, send, notifyTyping } =
    useChat(username);

  return (
    <div className="chat">
      <OnlineUsers users={onlineUsers} username={username} />
      <main className="main">
        <header>
          <div>
            <h1>General</h1>
            <span className={`status ${connected ? 'on' : 'off'}`}>
              {connected ? 'Connected' : 'Reconnecting…'}
            </span>
          </div>
          <button className="ghost" onClick={onLogout}>Leave as {username}</button>
        </header>
        {error && <div className="error" role="alert">{error}</div>}
        <MessageList
          messages={messages}
          username={username}
          typingUsers={typingUsers}
          loading={loading}
        />
        <MessageInput onSend={send} onTyping={notifyTyping} />
      </main>
    </div>
  );
}
