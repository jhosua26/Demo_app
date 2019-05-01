/**
 * Module Dependencies
 */
const errors = require('restify-errors');
let r = require('rethinkdb');

/**
 * Global variables
 */
let config = require('./config');
let db = module.exports;

/**
 * Open connection and Setup database
 */
db.setup = async() => {
    console.log('setting up rethinkdb')

    let connection = null
    await r.connect(config.rethinkdb).then((conn) => {
        exports.conn = connection = conn
        
        r.dbCreate(config.rethinkdb.db).run(conn).then(result => {
            console.log('database created')
            return result
        })
        .error(error => {
            console.log('database already created')
        })
        .finally(_ => {
            r.table('users').limit(1).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate('users').run(conn)
            })
            .error(error => {
                throw new errors.InternalServerError(error)
            })

            r.table('groups').limit(1).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate('groups').run(conn)
            })
            .error(error => {
                throw new errors.InternalServerError(error)
            })

            r.table('userGroups').limit(1).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate('userGroups').run(conn)
            })
            .error(error => {
                throw new errors.InternalServerError(error)
            })

            r.table('messages').limit(1).run(conn)
            .then(cursor => {
                cursor.toArray()
            }, (error) => {
                r.tableCreate('messages').run(conn)
            })
        })
    })
    .error(error => {
        return new errors.InternalServerError(error)
    })
}