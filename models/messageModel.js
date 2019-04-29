/**
 * Global Variables
 */
const db = require('../database')
let model = module.exports;

/**
 * Module Dependencies
 */
let r = require('rethinkdb');

/**
 * Insert User ID & Group ID, Message
 * @param {FK's from user&groups, message body} document 
 */
model.saveMessage = (document) => {
    return r.table('messages').insert(document, {
        returnChanges: true
    }).run(db.conn)
}

/**
 * Get All the messages in this Group
 * @param {ID of the Group} id 
 */
model.getMessagesInGroup = (id) => {
    return r.table('groups').get(id)
    .merge(e => {
        return {
            conversations: r.table('messages').getAll(e('id'), { index: 'group_id' }).without('group_id', 'id')
            .merge(ee => {
                return {
                    sender: r.table('users').get(ee('user_id')).pluck('username')
                }
            })
            .coerceTo('array')
        }
    })
    .run(db.conn)
}