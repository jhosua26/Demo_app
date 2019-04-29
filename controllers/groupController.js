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
let config = require('../config');

module.exports = (server) => {

    /**
     * validation:
     * if the group is exist it will throw an error
     * if the content type is not an object format it will throw an error
     */
    server.post('/group', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }
        await r.connect(config.rethinkdb).then(async(conn) => {
            let [group] = await r.table('groups').filter({
                name: req.body.name
            }).coerceTo('array').run(conn)

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
    server.get('/group/:group_id', (req, res, next) => {
        model.getGroup(req.params.group_id).then((result) => {
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
    server.get('/group_name/:group_id', async(req, res, next) => {
        model.getUsersInGroup(req.params.group_id).then((result) => {
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
    server.put('/group/:group_id', (req, res, next) => {
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
    server.del('/group/:group_id', (req, res, next) => {
        model.deleteGroup(req.params.group_id).then(async({changes}) => {
            res.send(changes)
            let [{
                old_val: {
                    id
                }
            }] = changes
            await r.connect(config.rethinkdb).then(async(conn) => {
                await r.table('userGroups').getAll(id, { index: 'group_id' }).delete().run(conn)
                await r.table('messages').getAll(id, { index: 'group_id' }).delete().run(conn)
            })
        })
        .catch(error => {
            return next(
                new errors.InternalServerError(error)
            )
        })
    })
};