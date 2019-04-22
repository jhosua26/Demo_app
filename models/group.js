var model = module.exports;
let r = require('rethinkdb');
let config = require('../config');

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

model.deleteGroup = (id, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('groups').get(id).delete().run(conn).then((result) => {
            callback(result)
        })
    })
}