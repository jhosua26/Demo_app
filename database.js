var db = module.exports;
let r = require('rethinkdb');
let config = require('./config');

let users = 'users';
let groups = 'groups';
let userGroups = 'userGroups';

db.setup = () => {
    console.log('setting up rethinkdb')

    r.connect(config.rethinkdb).then(conn => {
        r.dbCreate(config.rethinkdb.db).run(conn).then(result => {
            console.log('database created')
        })
        .error(error => {
            console.log('database already created')
        })
        .finally(_ => {
            r.table(users).limit(1).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate(users).run(conn)
            })
            .error(error => {
                throw error
            })

            r.table(groups).limit(1).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate(groups).run(conn)
            })
            .error(error => {
                throw error
            })

            r.table(userGroups).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate(userGroups).run(conn)
                .finally(_ => {
                    r.table(userGroups).indexCreate('user_group_id').run(conn)
                })
                .error(error => {
                    throw error
                })
            })
            .error(error => {
                throw error
            })
        })
    })
    .error(error => {
        throw error
    })
}