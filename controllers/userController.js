/**
 * Models
 */
const userModel = require('../models/userModel');

/**
 * Module Dependencies
 */
const r = require('rethinkdb');
const errors = require('restify-errors');

/**
 * Global variables
 */
let config = require('../config');

module.exports = (server) => {

    /**
     * validations:
     * if the user is exist it will throw an error
     * if the content type is not a json format, then it will throw an error
     */
    server.post('/user',  async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        await r.connect(config.rethinkdb).then(async(conn) => {
            let [user] = await r.table('users').filter({
                username: req.body.username
            }).coerceTo('array').run(conn)
            if(user) {
                return next(
                    new errors.ConflictError('user already exist')
                )
            } else {
                let userInfo = {
                    ...req.body,
                    createdAt: new Date().toISOString()
                }
                userModel.saveUser(userInfo, (success, result) => {
                    if(success) {
                        res.json({
                            status: 'Ok'
                        })
                    } else {
                        return next(
                            new errors.InternalServerError(error)
                        )
                    }
                })
            }
        })
    })

    /**
     * Get All users
     * @return array of objects
     */
    server.get('/users', (req, res, next) => {
        userModel.getUsers((result) => {
            if(result) {
                res.send(result)
            } else {
                return next(
                    new errors.ConflictError('No User Found')
                )
            }
        })
    })

    /**
     * Get User by ID
     * @return object
     */
    server.get('/user/:user_id', async(req, res, next) => {
        userModel.getUser(req.params.user_id, (result) => {
            if(result) {
                res.send(result)
            } else {
                return next(
                    new errors.ConflictError('No User Found')
                )
            }
        })
    })

    /**
     * Update User Info
     * @return success or failure message
     */
    server.put('/user/:user_id', (req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        const { body } = req
        userModel.updateUser(body, req.params.user_id, (result) => {
            if(result) {
                res.json({
                    status: 'Ok'
                })
            } else {
                return next(
                    new errors.InternalServerError(error)
                )
            }
        })
    })

    /**
     * Delete User Info
     * @return success or failure message
     */
    server.del('/user/:user_id', (req, res, next) => {
        userModel.deleteUser(req.params.user_id, (result) => {
            if(result) {
                res.json({
                    status: 'Ok'
                })
            } else {
                return next(
                    new errors.InternalServerError(error)
                )
            }
        })
    })
};