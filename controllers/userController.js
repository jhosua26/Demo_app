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
 * Global variables/functions
 */
const db = require('../database')
const errorResponse = (obj, next) => {
    const { username, email, password } = obj

    // let type

    // if(!username) {
    //     type = 'username'
    // } else if(!email) {
    //     type = 'email'
    // } else if(!password) {
    //     type = 'password'
    // }
    // if(type) {
    //     return next(new errors.BadRequestError(`${type} is required`))
    // }
    
    if(!username || !email || !password) {
        result = (!username && 'Username') || (!email && 'Email') || (!password && 'Password')
        return next(new errors.BadRequestError(`${result} is required`))
    } else {
        return true
    }
}

module.exports = (server) => {

    /**
     * validations:
     * if the user is exist it will throw an error
     * if the content type is not a json format, then it will throw an error
     */
    server.post('/users',  async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        try {
            const { body } = req

            errorResponse(body, next)

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
            
            errorResponse(body, next)

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