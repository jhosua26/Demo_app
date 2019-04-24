/**
 * Models
 */
const userModel = require('../models/userModel');

/**
 * 
 */
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
                userModel.saveUser(user, (success, result) => {
                    if(success) {
                        res.json({
                            status: 'Ok'
                        })
                    } else {
                        res.json({
                            status: 'Error'
                        })
                    }
                })
            }
        })
    })

    server.get('/users', (req, res) => {
        userModel.getUsers((result) => {
            res.send(result)
        })
    })

    server.get('/user/:user_id', async(req, res) => {
        // await r.connect(config.rethinkdb).then(async(conn) => {
        //     let user = await r.table('userGroups').eqJoin('user_id', r.table('users')).zip()
        //     .eqJoin('group_id', r.table('groups')).zip()
        //     .coerceTo('array').run(conn)
        //     res.send(user)
        // })

        // userModel.getUser(req.params.user_id, (result) => {
        //     console.log(result.id)
        //     res.send(result)
        // })

        // const { params : { group_id, user_id } } = req
        // await r.connect(config.rethinkdb).then(async(conn) => {
        //     let user = await r.table('users')
        //     .get(user_id)
        //     .merge((e) => {
        //         return {
        //             groups: r.table('userGroups').getAll(e('id'), { index: 'user_id' }).coerceTo('array')
        //         }
        //     })
        //     .run(conn)
        //     res.send(user)
        // })
    })

    server.put('/user/:user_id', (req, res) => {
        let user = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        userModel.updateUser(user, req.params.user_id, (result) => {
            res.send(result)
        })
    })

    server.del('/user/:user_id', (req, res) => {
        userModel.deleteUser(req.params.user_id, (result) => {
            res.send(result)
        })
    })

    server.get('/user/:user_id', async(req, res) => {
        await r.connect(config.rethinkdb).then(async(conn) => {
            let user = await r.table('messages').getAll(req.params.user_id, { index: 'receiver_id' })
            .coerceTo('array')
            .run(conn)

            res.send(user)
        })
    })
};