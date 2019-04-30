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
const db = require('../database')

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
        let [user] = await r.table('users').filter({
            username: req.body.username
        }).coerceTo('array').run(db.conn)

        if(user) {
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
    server.get('/users/:user_id', async(req, res, next) => {
        userModel.getUser(req.params.user_id).then((result) => {
            res.send(result)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })

    /**
     * Update User Info
     * @return success or failure message
     */
    server.put('/users/:user_id', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        try{
            const { body } = req
            let user = await userModel.updateUser(body, req.params.user_id)
            let {
                changes
            } = user
            if(!changes.length) {
                return next(
                    new errors.ConflictError('pls update')
                )
            }
            res.send(changes[0].new_val)
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })

    /**
     * Delete User Info
     * @return success or failure message
     */
    server.del('/users/:user_id', (req, res, next) => {
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