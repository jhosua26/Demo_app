const model = require('../models/user');
const r = require('rethinkdb');
let config = require('../config');
const errors = require('restify-errors');

module.exports = (server) => {

    server.post('/user',  (req, res, next) => {
        r.connect(config.rethinkdb)
        .then(async(conn) => {
            await r.table('users').run(conn)
            .then((cursor) => {
                cursor.each((error, result) => {
                    if(error) {
                        throw error
                    } else {
                        let username = result.username
                        if(username) {
                            console.log('dri')
                            return next(
                                new errors.ConflictError('email is already exist')
                            )
                        } else {
                            let user = {
                                username:req.body.username,
                                email:req.body.email,
                                password:req.body.password
                            };
                            model.saveUser(user, (success, result) => {
                                if(success) {
                                    res.json(success)
                                } else {
                                    res.json({
                                        status: 'Error'
                                    })
                                }
                            })
                        }
                    }
                })
            })
        })
    })

    server.get('/user', (req, res) => {
        model.getUsers((result) => {
            console.log(result, 'res')
            res.send(result)
        })
    })

    server.get('/user/:user_id', (req, res) => {
        model.getUser(req.params.user_id, (result) => {
            res.send(result)
        })
    })

    server.put('/user/:user_id', (req, res) => {
        let user = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        model.updateUser(user, req.params.user_id, (result) => {
            res.send(result)
        })
    })

    server.del('/user/:user_id', (req, res) => {
        model.deleteUser(req.params.user_id, (result) => {
            res.send(result)
        })
    })
};