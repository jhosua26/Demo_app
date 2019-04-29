/**
 * Global Object
 */
const db = require('../database')
let model = module.exports;

/**
 * Module Dependencies
 */
let r = require('rethinkdb');


/**
 * Insert User ID & Group ID
 * @param {FK's of user_id&group_id} document 
 */
model.saveUserGroup = (document) => {
    return r.table('userGroups').insert(document, {
        returnChanges: true
    }).run(db.conn)
}