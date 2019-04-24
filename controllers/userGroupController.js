/**
 * Models
 */
const userGroupModel = require('../models/userGroupModel');
const errors = require('restify-errors');

module.exports = (server) => {

    server.post('/userGroup', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let userGroupId = {
            user_id: req.body.userId,
            group_id: req.body.groupId,
        }
        userGroupModel.saveUserGroup(userGroupId, (success, error) => {
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
    })
}