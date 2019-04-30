/**
 * Models
 */
const messageModel = require('../models/messageModel');

/**
 * Modules Dependencies
 */
const r = require('rethinkdb');
const errors = require('restify-errors');

/**
 * Global variables
 */
const db = require('../database')

module.exports = (server) => {

    /**
     * Insert Messages in Group
     * Validation:
     * if the client trying to send an none Json format it will throw an error
     * if the Non-member User trying to send message in this group it will throw an error
     */
    server.post('/message', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let messageInfo = {
            ...req.body,
            createdAt: new Date().toISOString()
        }
        await r.table('userGroups').indexWait('user_group_id').run(db.conn)
        let [user] = await r.table('userGroups').getAll([messageInfo.user_id, messageInfo.group_id], { index: 'user_group_id' }).merge((userGroup) => {
            return {
                user: r.table('users').get(userGroup('user_id'))
            }
        }).coerceTo('array').run(db.conn)
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

    /**
     * Insert Message to User
     */
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

    /**
     * Get all Messages received by User
     * @return array of objects
     */
    server.get('/message/users/:id', async(req, res, next) => {
        messageModel.getMessageReceiveByUser(req.params.id).then((result) => {
            res.send(result)
        })
        .catch((error) => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })

    /**
     * Get all conversation from user to user
     */
    server.get('/messages/sender/:sender_id/receiver/:receiver_id', async(req, res, next) => {
        const { params : { sender_id, receiver_id } } = req
        // await r.table('userGroups').indexWait('ids').run(db.conn)
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
        .run(db.conn)
        res.send(userToUserMessages)
    })

    /**
     * Get all conversation in this Group
     */
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
