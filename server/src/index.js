const http = require('http');
const app = require('./app');
const initSockets = require('./sockets');
const { port } = require('./config');

const server = http.createServer(app);
app.set('io', initSockets(server));

server.listen(port, () => console.log(`Server listening on port ${port}`));

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
