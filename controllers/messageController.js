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
    server.post('/messages', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let messageInfo = {
            ...req.body,
            createdAt: new Date().toISOString()
        }

        try {
            if(!req.body.body)
            return next(new errors.BadRequestError('Please input some messages!'))

            await r.table('userGroups').indexWait('user_group_id').run(db.conn)
            let [user] = await r.table('userGroups').getAll([messageInfo.user_id, messageInfo.group_id], { index: 'user_group_id' }).merge((userGroup) => {
                return {
                    user: r.table('users').get(userGroup('user_id'))
                }
            }).coerceTo('array').run(db.conn)
            console.log(user, 'dri')
            if(!user) {
                return next(
                    new errors.ConflictError('this user is not exist in this group')
                )
            } else {
                let {changes: [{new_val}]} = await messageModel.saveMessage(messageInfo)
                res.send(new_val)
            }
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            ) 
        }
    })

    /**
     * Insert Message to User
     */
    server.post('/message',  async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        let messageInfo = {
            ...req.body,
            createdAt: new Date().toISOString()
        }
        if(!req.body.body)
            return next(new errors.BadRequestError('Please Input some messages!'))
        try {
            let {changes: [{new_val}]} = await messageModel.saveMessage(messageInfo)
            res.send(new_val)    
        } catch (error) {
            return next(
                new errors.InternalServerError(error)
            ) 
        }
    })

    /**
     * Get all Messages received by User
     * @return array of objects
     */
    server.get('/messages/users/:id', async(req, res, next) => {
        try {
            let message = await messageModel.getMessageReceiveByUser(req.params.id)
            res.send(message)
        } catch (error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })

    /**
     * Get all conversation from user to user
     */
    server.get('/messages/sender/:sender_id/receiver/:receiver_id', async(req, res, next) => {
        const { params : { sender_id, receiver_id } } = req
        try {
            await r.table('messages').indexWait('ids').run(db.conn)
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
        } catch (error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })

    /**
     * Get all conversation in this Group
     */
    server.get('/messages/groups/:id', async(req, res, next) => {
        try {
            const { params: { id } } = req
            let message = await messageModel.getMessagesInGroup(id)
            res.send(message)    
        } catch (error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })
};
