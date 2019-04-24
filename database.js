/**
 * Module Dependencies
 */
let config = require('./config');
const errors = require('restify-errors');
let r = require('rethinkdb');

let db = module.exports;
let groups = 'groups';
let messages = 'messages';
let userGroups = 'userGroups';
let users = 'users';

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
                throw new errors.InternalServerError(error)
            })

            r.table(groups).limit(1).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate(groups).run(conn)
            })
            .error(error => {
                throw new errors.InternalServerError(error)
            })

            r.table(userGroups).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate(userGroups).run(conn)
            })
            .error(error => {
                throw new errors.InternalServerError(error)
            })

            r.table(messages).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate(messages).run(conn)
                .finally(_ => {
                    r.table(messages).indexCreate('user_id').run(conn)
                })
                .error(error => {
                    throw new errors.InternalServerError(error)
                })
            })
        })
    })
    .error(error => {
        throw new errors.InternalServerError(error)
    })
}