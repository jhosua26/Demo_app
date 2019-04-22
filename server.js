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
  * Middleware
  */
server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());
const userRoutes = require('./controllers/user')(server);
const groupRoutes = require('./controllers/group')(server);

db.setup()
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