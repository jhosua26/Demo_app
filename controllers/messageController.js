/**
 * Models
 */
const messageModel = require('../models/messageModel');

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
                messageModel.saveMessage(messageInfo).then(({changes: [{new_val}]}) => {
                    res.send(new_val)
                })
                .catch(error => {
                    return next(
                        new errors.InternalServerError(error)
                    ) 
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
        messageModel.saveMessage(messageInfo).then(({changes: [{new_val}]}) => {
            res.send(new_val)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            ) 
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
                    sender: r.table('users').get(e('sender_id')).pluck('username'),
                    receiver: r.table('users').get(e('receiver_id')).pluck('username')
                }
            })
            .without('sender_id', 'receiver_id')
            .coerceTo('array')
            .run(conn)
            res.send(userToUserMessages)
        })
    })

    // Get all Conversation in this group
    server.get('/messages/group/:id', async(req, res, next) => {
        const { params: { id } } = req
        messageModel.getMessagesInGroup(id)
        .then((result) => {
            res.send(result)
        })
        .catch((error) => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })
};

