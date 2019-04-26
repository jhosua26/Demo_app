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
            let {changes: [{
                new_val
            }]} = await r.table('users').insert(userInfo, {
                returnChanges: true
            }).run(conn)
            res.send(new_val)
            // let [user] = changes.map(result => {
            //     return result.new_val
            // })
            // res.send(user)
        }
        // console.log(query)
        // await r.connect(config.rethinkdb).then(async(conn) => {
        //     let [user] = await r.table('users').filter({
        //         username: req.body.username
        //     }).coerceTo('array').run(conn)
        //     if(user) {
        //         return next(
        //             new errors.ConflictError('user already exist')
        //         )
        //     } else {
        //         let userInfo = {
        //             ...req.body,
        //             createdAt: new Date().toISOString()
        //         }
        //         let connect = await r.connect(config.rethinkdb).then(async(conn) => {
        //             return r.table('users').insert(userInfo, {
        //                 returnChanges: true
        //             }).run(conn)
        //         })
        //         connect.then((result) => {
        //             let {
        //                 changes
        //             } = result
        //             let [userInfo] = changes.map(result => {
        //                 return result
        //             })
                    
        //             res.send(userInfo)
        //         })
        //     }
        // })
    })

    /**
     * Get All users
     * @return array of objects
     */
    server.get('/users', async(req, res, next) => {
        await r.connect(config.rethinkdb).then(async(conn) => {
            await r.table('users').run(conn).then((cursor) => {
                // cursor.
            })
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