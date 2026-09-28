const db = require('../db');

const MAX_LENGTH = 1000;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const toDto = (row) => ({
  id: row.id,
  username: row.username,
  text: row.text,
  createdAt: row.created_at,
});

function validate({ username, text }) {
  const u = typeof username === 'string' ? username.trim() : '';
  const t = typeof text === 'string' ? text.trim() : '';
  if (!u) throw new ValidationError('username is required');
  if (u.length > 30) throw new ValidationError('username must be 30 characters or fewer');
  if (!t) throw new ValidationError('text is required');
  if (t.length > MAX_LENGTH) throw new ValidationError(`text must be ${MAX_LENGTH} characters or fewer`);
  return { username: u, text: t };
}

function createMessage(input) {
  const { username, text } = validate(input);
  const info = db.prepare('INSERT INTO messages (username, text) VALUES (?, ?)').run(username, text);
  return toDto(db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid));
}

/** Returns the latest `limit` messages (oldest first). `before` = id cursor for paging. */
function getHistory({ limit = 100, before } = {}) {
  const l = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
  const rows = before
    ? db.prepare('SELECT * FROM messages WHERE id < ? ORDER BY id DESC LIMIT ?').all(parseInt(before, 10), l)
    : db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT ?').all(l);
  return rows.reverse().map(toDto);
}

module.exports = { createMessage, getHistory, ValidationError };
