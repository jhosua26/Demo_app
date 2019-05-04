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
        try {
            if (!req.body.email) 
                return next(new errors.BadRequestError('Email is required!'))
            if (!req.body.username) 
                return next(new errors.BadRequestError('Username is required!'))
            if (!req.body.password) 
                return next(new errors.BadRequestError('Password is required!'))

            let userInfo = {
                ...req.body,
                createdAt: new Date().toISOString()
            }
            let [userExist] = await r.table('users').filter({
                username: req.body.username
            }).coerceTo('array').run(db.conn)
            
            if(userExist) {
                return next(
                    new errors.ConflictError('user already exist')
                )
            } else {
                let {changes: [{new_val}]} = await userModel.saveUser(userInfo)
                res.send(new_val)
            }
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
        
    })

    /**
     * Get All users
     * @return array of objects
     */
    server.get('/users', async(req, res, next) => {
        try {
            let result = await userModel.getUsers()
            res.send(result)
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })
    
    /**
     * Get User by ID
     * @return object
     */
    server.get('/users/:user_id', async(req, res, next) => {
        try {
            let result = await userModel.getUser(req.params.user_id)
            res.send(result)
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })

    /**
     * Update User Info
     * @return success or failure message
     */
    server.put('/users/:user_id', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			)
        }
        try{
            const { body } = req

            if(!body.username)
                return next(new errors.BadRequestError('Username is required!'))
            if(!body.email)
                return next(new errors.BadRequestError('Email is required!'))
            if(!body.password)
                return next(new errors.BadRequestError('Password is required!'))

            let user = await userModel.updateUser(body, req.params.user_id)

            if(user.replaced !== 1 && user.unchanged === 1) 
                return next(
                    new errors.BadRequestError('Please Update User Info')
                )
            else 
                res.send(body)                
            
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
    server.del('/users/:user_id', async(req, res, next) => {
        try {
            let user = await userModel.deleteUser(req.params.user_id)
            if(user.deleted === 0 && user.unchanged === 0) 
                return next(new errors.BadRequestError('Please check you id params!'))

            let {
                changes
            } = user
            res.send(user)
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })
};