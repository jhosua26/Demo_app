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
model.saveUserGroup = (document, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('userGroups').insert(document).run(conn).then((result) => {
            callback(result)
        }).error((error) => {
            callback(error)
        })
    }).error((error) => {
        callback(false, error)
    })
}

model.getUserGroups = (callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('userGroups')
    })
    .error((error) => {
        callback(false, error)
    })
}

/**
 * Insert Messages
 * @param {result, error} callback 
 */
model.getUserAndGroups = (callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('userGroups').run(conn).then((cursor) => {
            cursor.toArray()
            .then(result => callback(result)
            , error => {
                throw error
            })
        }).error((error) => {
            throw error
        });
    })
    .error((error) => {
        throw error
    })
}