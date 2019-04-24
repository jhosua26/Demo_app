/**
 * Models
 */
const messageModel = require('../models/messageModel');
const userGroupModel = require('../models/userGroupModel');

/**
 * Modules Dependencies
 */
const r = require('rethinkdb');
let config = require('../config');
const errors = require('restify-errors');

module.exports = (server) => {

    server.post('/message',  (req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let {
            userId,
            groupId,
        } = req.body
        r.connect(config.rethinkdb).then(async(conn) => {
            let [user] = await r.table('userGroups').getAll([userId, groupId], { index: 'user_group_id' }).merge((userGroup) => {
                return {
                    user: r.table('users').get(userGroup('user_id'))
                }
            }).coerceTo('array').run(conn)
            console.log(user, 'user')
            if(user == null) {
                return next(
                    new errors.ConflictError('this user is not exist in this group')
                )
            } else {
                messageModel.saveMessage(req.body, (success, error) => {
                    if(success) {
                        res.json({
                            status: !!success.inserted
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

    server.post('/messages',  (req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let { body } = req
        messageModel.saveMessage(body, (success, error) => {
            if(success) {
                res.json({
                    status: !!success.inserted
                })
            } else {
                return next(
                    new errors.InternalServerError(error)
                )
            }
        })
    })

    server.get('/message', (req, res) => {
        userGroupModel.getUserAndGroups((result) => {
            res.send(result)
        })
    })
};