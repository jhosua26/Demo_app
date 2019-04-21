// /**
//  * Module Dependencies
//  */
// const errors = require('restify-errors');
// const Router = require('restify-router').Router,
//     router = new Router(),
//     r = require('../database').r

// /**
//  * Routes
//  */


// // module.exports = (server) => {
// // 	server.post('/user', async (req, res, next) => {
// // 		//
// // 	})
// // };    

// const insertUser = async(req, res, next) => {
//     console.log(req.body);
//     const result = r.table('users').insert({
//         username: req.body.username,
//         email: req.body.email,
//         password: req.body.password,
//         createdAt: new Date()
//     }, {
//         returnChanges: true
//     }).run()
//     res.send(result)
//     return next()
// }

// router.post('/user', insertUser)

// module.exports = router;