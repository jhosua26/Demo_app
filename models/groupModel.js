/**
 * Global variable
 */
let config = require('../config');
let model = module.exports;

/**
 * Module Dependencies
 */
let r = require('rethinkdb');

/**
 * Insert Groups
 * @param {group document} group 
 * @param {result || error} callback 
 */
model.saveGroup = async(group, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('groups').insert(group).run(conn).then((results) => {
            callback(results);
        }).error((error) => {
            callback(error);
        });
    }).error((error) => {
        callback(false, error);
    });
}

/**
 * Get All Groups
 * @param {result || error} callback 
 */
model.getGroups = async(callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('groups').run(conn).then((cursor) => {
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

/**
 * Get Group by ID
 * @param {ID of the group} id 
 * @param {result || error} callback 
 */
model.getGroup = async(id, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('groups').get(id).run(conn).then((cursor) => {
            callback(cursor)
        })
    })
    .error((error) => {
        throw error
    })
}

/**
 * Update Group by ID
 * @param {group document} group 
 * @param {ID of the group} id 
 * @param {result || error} callback 
 */
model.updateGroup = async(group, id, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('groups').get(id).update(group).run(conn).then((result) => {
            callback(result)
        }).error((error) => {
            callback(error)
        })
    }).error((error) => {
        callback(error)
    })
}

/**
 * Delete Group by ID
 * @param {ID of the group} id 
 * @param {result || error} callback 
 */
model.deleteGroup = async(id, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('groups').get(id).delete().run(conn).then((result) => {
            callback(result)
        })
    })
}