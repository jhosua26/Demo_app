/**
 * Module Dependencies
 */
const config = require('./config');
const db = require('./database');
const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const model = require('./models/user');

/**
 * Routes
 */
const usersRoute = require('./routes/user');

/**
  * Initialize Server
  */
const server = restify.createServer({
	name: config.name,
	version: config.version,
});

/**
  * Middleware
  */
server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());
const routes = require('./controllers/user')(server);
// usersRoute.applyRoutes(server);

model.setup()
server.listen(config.port, () => {
    console.log('Server up and listening on port %d', config.port);
});

server.on('ConflictError', (req, res, err, cb) => {
	myMetrics.capture(err);
	return cb();
});

server.on('InternalServer', (req, res, err, cb) => {
  err.toString = () => {
    return 'an internal server error occurred!';
  };
  // for any response that is application/json
  err.toJSON = () => {
    return {
      message: 'an internal server error occurred!'
    }
  };

  return cb();
});