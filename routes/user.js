'use strict';

/**
 * Module Dependencies
 */
const r = require('rethinkdb');
const errors = require('restify-errors');
const Router = require('restify-router').Router,
    router = new Router();

/**
 * Routes
 */


// // module.exports = (server) => {
// // 	server.post('/user', async (req, res, next) => {
// // 		//
// // 	})
// // };    

router.post('/user', (req, res, next) => {
    r.db('chat_app').table('users').run()
    .then(cursor => cursor.toArray())
    .then(result => {
        res.send(result)
    })
    .catch(error => res.send(error))

})

module.exports = router;