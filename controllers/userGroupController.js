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
const db = require('../database')

module.exports = (server) => {

    /**
     * validations:
     * if the user exist in this group will throw an error
     * if the content type is not a json format, then it will throw an error
     */
    server.post('/usergroup', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let { body } = req
        let [userExist] = await r.table('userGroups').filter({
            user_id: body.user_id,
            group_id: body.group_id
        })
        .coerceTo('array')
        .run(db.conn)

        if(userExist) {
            return next(
                new errors.ConflictError('user is already exist in this group')
            )
        } else {
            userGroupModel.saveUserGroup(body).then(({changes: [{new_val}]}) => {
                res.send(new_val)
            })
            .catch(error => {
                return next(
                    new errors.InternalServerError(error)
                ) 
            })
        }
    })
}