let model = module.exports;
let r = require('rethinkdb');
let config = require('../config');

/**
 * Insert User
 * @param {user document} user 
 * @param {response & error} callback 
 */
model.saveUser = async(user, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('users').insert(user).run(conn).then((results) => {
            callback(results);
        }).error((error) => {
            callback(error);
        });
    }).error((error) => {
        callback(false, error);
    });
}

/**
 * Get All User
 * @param {response & error} callback 
 */
model.getUsers = async(callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('users').run(conn).then((cursor) => {
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
 * Get User by ID
 * @param {ID of the user} id 
 * @param {response, error} callback 
 */
model.getUser = async(id, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('users').get(id).run(conn).then((cursor) => {
            callback(cursor)
        })
    })
    .error((error) => {
        throw error
    })
}

model.getUserWithMessage = async(id, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('users').get(id).run(conn).then((cursor) => {
            callback(cursor)
        })
    })
    .error((error) => {
        callback(error)
    })
}

/**
 * Modify All Document of the User
 * @param {document from the client} user 
 * @param {ID of the user} id 
 * @param {response, error} callback 
 */
model.updateUser = async(user, id, callback) => {
    await r.connect(config.rethinkdb).then(async(conn) => {
        await r.table('users').get(id).update(user).run(conn).then((result) => {
            callback(result)
        }).error((error) => {
            callback(error)
        })
    }).error((error) => {
        callback(error)
    })
}

/**
 * Delete User by ID
 * @param {ID of the User} id 
 * @param {response, error} callback 
 */
model.deleteUser = (id, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('users').get(id).delete().run(conn).then((result) => {
            callback(result)
        })
    })
}