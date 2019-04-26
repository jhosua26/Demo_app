/**
 * Models
 */
const messageModel = require('../models/messageModel');
const userGroupModel = require('../models/userGroupModel');

/**
 * Modules Dependencies
 */
const r = require('rethinkdb');
const config = require('../config');
const errors = require('restify-errors');

module.exports = (server) => {

    server.post('/message',  (req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let messageInfo = {
            ...req.body,
            createdAt: new Date().toISOString()
        }
        r.connect(config.rethinkdb).then(async(conn) => {
            let [user] = await r.table('userGroups').getAll([messageInfo.user_id, messageInfo.group_id], { index: 'user_group_id' }).merge((userGroup) => {
                return {
                    user: r.table('users').get(userGroup('user_id'))
                }
            }).coerceTo('array').run(conn)
            if(user == null) {
                return next(
                    new errors.ConflictError('this user is not exist in this group')
                )
            } else {
                messageModel.saveMessage(messageInfo, (success, error) => {
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

    server.post('/messages',  (req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let messageInfo = {
            ...req.body,
            createdAt: new Date().toISOString()
        }
        messageModel.saveMessage(messageInfo, (success, error) => {
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

    // Get all messages received by user
    server.get('/message/:id', async(req, res) => {
        await r.connect(config.rethinkdb).then(async(conn) => {
            let user = await r.table('messages').getAll(req.params.id, { index: 'receiver_id' })
            .merge(e => {
                return r.table('users').get(e('sender_id'))
            })
            .pluck('body', 'sender_id', 'username')
            .coerceTo('array')
            .run(conn)
            res.send(user)
        })
    })

    // Get all conversation from user to user
    server.get('/messages/sender/:sender_id/receiver/:receiver_id', async(req, res, next) => {
        const { params : { sender_id, receiver_id } } = req
        await r.connect(config.rethinkdb).then(async(conn) => {
            let userToUserMessages = await r.table('messages').getAll([sender_id, receiver_id], { index: 'ids' })
            .union(
                r.table('messages').getAll([receiver_id, sender_id], { index: 'ids' })
            )
            .merge(e => {
                return {
                    sender: r.table('users').get(e('sender_id')).pluck('username')
                }
            })
            .without('sender_id')
            .coerceTo('array')
            .run(conn)
            res.send(userToUserMessages)
        })
    })

    // Get all Conversation in this group
    server.get('/messages/group/:id', async(req, res, next) => {
        const { params: { id } } = req
        await r.connect(config.rethinkdb).then(async(conn) => {
            let groupMessages = await r.table('groups').get(id)
            .merge(e => {
                return {
                    conversations: r.table('messages').getAll(e('id'), { index: 'group_id' })
                    .merge(ee => {
                        return {
                            sender: r.table('users').get(ee('user_id')).pluck('username')
                        }
                    })
                    .coerceTo('array')
                }
            })
            .run(conn)
            res.send(groupMessages)
        })
    })
};

