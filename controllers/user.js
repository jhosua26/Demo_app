const model = require('../models/user');

module.exports = (server) => {

    server.post('/user',  (req, res) => {
        let movie = {
            username:req.body.username,
            email:req.body.email,
            passsword:req.body.password
        };
        model.saveUser(movie, (success, result) => {
            if (success) res.json({
                status: 'OK'
            });
            else res.json({
                status: 'Error'
            });
        });
    });
};

// /**
//  * Module Dependencies
//  */
// const errors = require('restify-errors');
// const Router = require('restify-router').Router,
//     router = new Router(),


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