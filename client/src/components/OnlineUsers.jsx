export default function OnlineUsers({ users, username }) {
  return (
    <aside className="sidebar">
      <h2>Online now <span>{users.length}</span></h2>
      <ul>
        {users.map((u) => (
          <li key={u}>
            <i className="dot" />
            {u}{u === username ? ' (you)' : ''}
          </li>
        ))}
      </ul>
    </aside>
  );
}
