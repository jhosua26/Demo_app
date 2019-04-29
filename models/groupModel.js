/**
 * Global variable
 */
const db = require('../database')
let model = module.exports;

/**
 * Module Dependencies
 */
let r = require('rethinkdb');

/**
 * Insert Groups
 * @param {group document} group 
 */
model.saveGroup = (group) => {
    return r.table('groups').insert(group, {
        returnChanges: true
    }).run(db.conn)
}

/**
 * Get All Groups
 */
model.getGroups = () => {
    return r.table('groups').coerceTo('array').run(db.conn)
}

/**
 * Get Group by ID
 * @param {ID of the group} id 
 */
model.getGroup = (id) => {
    return r.table('groups').get(id).coerceTo('object').run(db.conn)
}

/**
 * Get All User in Group
 * @param {Group Id} id 
 */
model.getUsersInGroup = (id) => {
    return r.table('groups').get(id)
    .merge((e) => {
        return {
            participants: r.table('userGroups').getAll(e('id'), { index: 'group_id' }).without('group_id', 'id')
            .merge(ee => {
                return r.table('users').get(ee('user_id')).pluck('username', 'user_id')
                
            }).coerceTo('array')
        } 
    }).run(db.conn)
}

/**
 * Update Group by ID
 * @param {group document} group 
 * @param {ID of the group} id 
 */
model.updateGroup = (group, id) => {
    return r.table('groups').get(id).update(group, {
        returnChanges: true
    }).run(db.conn)
}

/**
 * Delete Group by ID
 * @param {ID of the group} id
 */
model.deleteGroup = (id) => {
    return r.table('groups').get(id).delete({
        returnChanges: true
    }).run(db.conn)
}