module.exports = {
	name: 'API',
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 3000,
	base_url: process.env.BASE_URL || 'http://localhost:3000',
	rethinkdb: {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 28015,
        db: process.env.DB_NAME || "chat_app",
    }
};