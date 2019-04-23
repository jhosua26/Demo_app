const model = require('../models/userModel');
const r = require('rethinkdb');
let config = require('../config');
const errors = require('restify-errors');

module.exports = (server) => {

    /**
     * validations:
     * if the user is exist it will throw an error
     * if the content type is not a json format, then it will throw an error
     */
    server.post('/user',  (req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        r.connect(config.rethinkdb).then(async(conn) => {
            let [user] = await r.table('users').filter({
                username: req.body.username
            }).coerceTo('array').run(conn)

            if(user) {
                return next(
                    new errors.ConflictError('user already exist')
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
        })
    })

    server.get('/user', (req, res) => {
        model.getUsers((result) => {
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