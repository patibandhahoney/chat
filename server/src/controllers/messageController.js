const messageService = require('../services/messageService');

// POST /api/messages
exports.send = (req, res, next) => {
  try {
    const message = messageService.createMessage(req.body || {});
    // Broadcast to every connected client in real time
    req.app.get('io').emit('message:new', message);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

// GET /api/messages?limit=100&before=<id>
exports.history = (req, res, next) => {
  try {
    res.json(messageService.getHistory(req.query));
  } catch (err) {
    next(err);
  }
};
