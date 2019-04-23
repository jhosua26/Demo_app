var model = module.exports;
let r = require('rethinkdb');
let config = require('../config');

/**
 * Insert Groups
 * @param {group document} group 
 * @param {response & error} callback 
 */
model.saveGroup = (group, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('groups').insert(group).run(conn).then((results) => {
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
 * @param {response, error} callback 
 */
model.getGroups = (callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('groups').run(conn).then((cursor) => {
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
 * @param {response, error} callback 
 */
model.getGroup = (id, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('groups').get(id).run(conn).then((cursor) => {
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
 * @param {response, error} callback 
 */
model.updateGroup = (group, id, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('groups').get(id).update(group).run(conn).then((result) => {
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
 * @param {response, error} callback 
 */
model.deleteGroup = (id, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('groups').get(id).delete().run(conn).then((result) => {
            callback(result)
        })
    })
}