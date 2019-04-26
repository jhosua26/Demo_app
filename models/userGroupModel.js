/**
 * Global Object
 */
let model = module.exports;
let r = require('rethinkdb');
let config = require('../config');

/**
 * Insert User ID & Group ID
 * @param {FK's of user_id&group_id} document 
 * @param {response, error} callback 
 */
model.saveUserGroup = async(document, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('userGroups').insert(document).run(conn).then((result) => {
            callback(result)
        }).error((error) => {
            callback(error)
        })
    }).error((error) => {
        callback(false, error)
    })
}

/**
 * Get All user in Group
 * @param {Group Id} id 
 * @param {result || error} callback 
 */
model.getUserAndGroups = async(id, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('groups').get(id).merge(e => {
            return r.table('userGroups').getAll(e('id'), { index: 'group_id' }).coerceTo('array')
        }).run(conn).then((cursor) => {
            cursor.toArray()
            .then(result => callback(result)
            , error => {
                throw error
            })
        }).error((error) => {
            throw error
        })
    })
    .error((error) => {
        throw error
    })
}