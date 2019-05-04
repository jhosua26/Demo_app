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
        
        try {
            if(!req.body.name) 
                return next(new errors.BadRequestError('Name is required'))
            
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
                let {changes: [{new_val}]} = await model.saveGroup(groupInfo)
                res.send(new_val)
            }
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })

    /**
     * Get All Groups
     * @return array of object
     */
    server.get('/groups', async(req, res, next) => {
        try {
           let group = await model.getGroups() 
           res.send(group)
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            ) 
        }
    })

    /**
     * Get Group by Id
     * @return object
     */
    server.get('/groups/:group_id', async(req, res, next) => {
        try {
            let group = await model.getGroupById(req.params.group_id)
            res.send(group)
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })

    /**
     * Get Users in Group
     * @return object
     */
    server.get('/groups/:group_id/users', async(req, res, next) => {
        try {
            let group = await model.getUsersInThisGroup(req.params.group_id)
            res.send(group)
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })

    /**
     * Update Group Info
     * @return success or failure message
     */
    server.put('/groups/:group_id', async(req, res, next) => {
        if (!req.is('application/json')) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'"),
			);
        }

        try {
            const { body } = req

            if(!req.body.name) 
                return next(new errors.BadRequestError('Name is required!'))
            
            let group = await model.updateGroup(body, req.params.group_id)

            if(group.replaced === 0 && group.unchanged === 1)
                return next(new errors.BadRequestError('Please update group name!'))
            else
                res.send(body)
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })

    /**
     * Delete Group
     * @return success or failure message
     * ON DELETE CASCADE
     */
    server.del('/groups/:group_id', async(req, res, next) => {
        try {
            let {changes} = await model.deleteGroup(req.params.group_id)

            let [{old_val: {id}}] = changes
            await r.table('userGroups').getAll(id, { index: 'group_id' }).delete().run(db.conn)
            await r.table('messages').getAll(id, { index: 'group_id' }).delete().run(db.conn)

            res.send(changes)
        } catch(error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })

    /**
     * Search Filter
     * @param username, email
     * @return Object 
     */
    server.get('/groups/:id/user', async(req, res, next) => {
        try {
            let username = req.params.username
            let email = req.params.email
            let [userExist] = await r.table('userGroups').getAll(req.params.id, { index: 'group_id' })
            .merge((users) => {
                return {
                    user: r.table('users').get(users('user_id'))
                }
            })
            .filter(function(user) {
                return user('user')('username').default('Anonymous').match(username)
                .or(user('user')('email').default('Anonymous').match(email))
            })
            .coerceTo('array')
            .run(db.conn)

            if(!userExist) {
                return next(new errors.BadRequestError('No user found!'))
            } else {
                res.send(userExist)
            }
        } catch (error) {
            return next(
                new errors.InternalServerError(error)
            )
        }
    })
};