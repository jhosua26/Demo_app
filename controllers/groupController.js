/**
 * Models
 */
const model = require('../models/groupModel');

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
     * validation:
     * if the group is exist it will throw an error
     * if the content type is not an object format it will throw an error
     */
    server.post('/groups', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        
        let [group] = await r.table('groups').filter({
            name: req.body.name
        }).coerceTo('array').run(db.conn)

        if(group) {
            return next(
                new errors.ConflictError('group already exist')
            )
        } else {
            let groupInfo = {
                ...req.body,
                createdAt: new Date().toISOString()
            }
            model.saveGroup(groupInfo).then(({changes: [{new_val}]}) => {
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
     * Get All Groups
     * @return array of object
     */
    server.get('/groups', (req, res, next) => {
        model.getGroups().then((result) => {
            res.send(result)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })

    /**
     * Get Group by Id
     * @return object
     */
    server.get('/groups/:group_id', (req, res, next) => {
        model.getGroupById(req.params.group_id).then((result) => {
            res.send(result)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })

    /**
     * Get Users in Group
     * @return object
     */
    server.get('/groups/:group_id/users', async(req, res, next) => {
        model.getUsersInThisGroup(req.params.group_id).then((result) => {
            res.send(result)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            ) 
        })
    })

    /**
     * Update Group Info
     * @return success or failure message
     */
    server.put('/groups/:group_id', (req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        model.updateGroup({name: req.body.name}, req.params.group_id).then(({changes: [{new_val}]}) => {
            res.send(new_val)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })

    /**
     * Delete Group
     * @return success or failure message
     * ON DELETE CASCADE
     */
    server.del('/groups/:group_id', (req, res, next) => {
        model.deleteGroup(req.params.group_id).then(async({changes}) => {
            res.send(changes)
            let [{
                old_val: {
                    id
                }
            }] = changes
            await r.table('userGroups').getAll(id, { index: 'group_id' }).delete().run(db.conn)
            await r.table('messages').getAll(id, { index: 'group_id' }).delete().run(db.conn)
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })
};