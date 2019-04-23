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
        let messageInfo = {
            userId: req.body.userId,
            body: req.body.body
        }
        r.connect(config.rethinkdb).then(async(conn) => {
            let [user] = await r.table('userGroups').filter({
                user_id: req.body.userId,
                group_id: req.body.groupId
            }).merge((userGroup) => {
                return {
                    user: r.table('users').get(userGroup('user_id'))
                }
            }).coerceTo('array').run(conn)
            if(user) {
                return next(
                    new errors.ConflictError('this user is not exist in this group')
                )
            } else {
                messageModel.saveMessage(messageInfo, (success, error) => {
                    if(success) {
                        res.json(success)
                    } else {
                        return next(
                            new errors.InternalServerError(error)
                        )
                    }
                })
            }
        })
    })

    server.get('/message', (req, res) => {
        userGroupModel.getUserAndGroups((result) => {
            res.send(result)
        })
    })
};