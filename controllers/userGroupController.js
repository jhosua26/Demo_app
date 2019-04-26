/**
 * Models
 */
const userGroupModel = require('../models/userGroupModel');

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
     * if the user exist in this group will throw an error
     * if the content type is not a json format, then it will throw an error
     */
    server.post('/userGroup', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let { body } = req
        await r.connect(config.rethinkdb).then(async(conn) => {
            let [userExist] = await r.table('userGroups').filter({
                user_id: body.user_id,
                group_id: body.group_id
            })
            .coerceTo('array')
            .run(conn)

            if(userExist) {
                return next(
                    new errors.ConflictError('user is already exist in this group')
                )
            } else {
                userGroupModel.saveUserGroup(body, (success, error) => {
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

    server.get('/userGroup/:group_id', async(req, res, next) => {
        userGroupModel.getUserAndGroups(req.params.group_id, (result) => {
            if(result) {
                res.send(result)
            } else {
                return next(
                    new errors.InternalServerError(error)
                ) 
            }
        })
    })
}