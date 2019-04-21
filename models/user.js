var model = module.exports;
var r = require('rethinkdb');
var config = require('../config');

var users = 'users';

model.setup = (callback) => {
    console.log('setting up rethinkdb')

    r.connect(config.rethinkdb).then(conn => {
        r.dbCreate(config.rethinkdb.db).run(conn).then(result => {
            console.log('database created')
        })
        .error(error => {
            console.log('database already created')
        })
        .finally(_ => {
            r.table(users).limit(1).run(conn, (error, cursor) => {
                let promise
                if(error) {
                    console.log('creating table')
                    promise = r.tableCreate(users).run(conn)
                } else {
                    promise = cursor.toArray()
                }

                promise.then(result => {
                    console.log('setting up udpate listener')
                    r.table(users).changes().run(conn).then(cursor => {
                        cursor.each((error, row) => {
                            // callback(row)
                            console.log(row, 'test')
                        })
                    })
                })
                .error(error => {
                    throw error
                })
            })
        })
    })
    .error(error => {
        throw error
    })
}

model.saveUser = (user, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table(users).insert(user).run(conn).then((results) => {
            callback(true, results);
        }).error((error) => {
            callback(false, error);
        });
    }).error((error) => {
        callback(false, error);
    });
}