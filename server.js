/**
 * Module Dependencies
 */
const db = require('./database');
const config = require('./config'),
  restify = require('restify'),
  restifyPlugins = require('restify-plugins');

/**
  * Initialize Server
  */
const server = restify.createServer({
	name: config.name,
	version: config.version,
});

/**
 * Routes
 */
const messageRoutes = require('./controllers/messageController')(server);
const groupRoutes = require('./controllers/groupController')(server);
const userGroupRoutes = require('./controllers/userGroupController')(server);
const userRoutes = require('./controllers/userController')(server);

/**
  * Middleware
  */
server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());

db.setup().then(_ => {
  server.listen(config.port, () => {
    console.log('Server up and listening on port %d', config.port);
  });
})