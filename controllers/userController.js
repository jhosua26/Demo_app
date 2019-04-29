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
        let userInfo = {
            ...req.body,
            createdAt: new Date().toISOString()
        }
        let conn = await r.connect(config.rethinkdb)
        let [query] = await r.table('users').filter({
            username: req.body.username
        }).coerceTo('array').run(conn)

        if(query) {
            return next(
                new errors.ConflictError('user already exist')
            )
        } else {
            userModel.saveUser(userInfo).then(({changes: [{new_val}]}) => {
                res.send(new_val)
            })
            .catch(error => {
                return next(
                    new errors.InternalServerError(error)
                )
            })
        }
    })

    /**
     * Get All users
     * @return array of objects
     */
    server.get('/users', async(req, res, next) => {
        userModel.getUsers().then((result) => {
            res.send(result)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })
    
    /**
     * Get User by ID
     * @return object
     */
    server.get('/user/:user_id', async(req, res, next) => {
        userModel.getUser(req.params.user_id).then((result) => {
            res.send(result)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })

    // Get all messages received by user
    server.get('/users/:id/message', async(req, res, next) => {
        userModel.getMessageReceiveByUser(req.params.id).then((result) => {
            res.send(result)
        })
        .catch((error) => {
            return next(
                new errors.InternalServerError(error)
            )
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
        userModel.updateUser(body, req.params.user_id).then(({changes: [{new_val}]}) => {
            res.send(new_val)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })

    /**
     * Delete User Info
     * @return success or failure message
     */
    server.del('/user/:user_id', (req, res, next) => {
        userModel.deleteUser(req.params.user_id)
        .then((result) => {
            let {
                changes
            } = result
            res.send(changes)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })
};