/**
 * Module Dependencies
 */
const config = require('./config');
const r = require('rethinkdb'); 

/**
 * Create a RethinkDB connection
 */
// r.connect(config.rethinkdb)
//   .then((conn) => {
//     r.dbList().run(conn)
//     .then((dblist) => {
//       if(dblist.indexOf(config.rethinkdb.db) > -1) {
//         initialize(conn)
//       } else {
//         r.dbList().contains('chat_app')
//         .do((databaseExists) => {
//           return r.branch(
//             databaseExists,
//             { dbs_created: 0 },
//             r.dbCreate(config.rethinkdb.db).run(conn)
//             .then(initialize(conn))
//           )
//         }).run(conn)
//       }
//     })
//   })
//   .error((error) => {
//       console.log(error.message);
//       process.exit(1)
//   });

module.exports.createDatabase = () => {
    r.connect(config.rethinkdb)
        .then((conn) => {
        r.dbList().run(conn)
        .then((dblist) => {
            if(dblist.indexOf(config.rethinkdb.db) > -1) {
                initialize(conn)
            } else {
                r.dbCreate(config.rethinkdb.db).run(conn)
                .then(initialize(conn))
            }
        })
    })
    .error((error) => {
        console.log(error.message);
        process.exit(1)
    });

    var initialize = function(conn) {
        r.table('userGroups').indexWait('user_group_id').run(conn)
        .then(_ => console.log('index created!'))
        .error((error) =>{
            r.tableCreate('userGroups').run(conn)
            .finally(_ => {
                r.table('userGroups').indexCreate('user_group_id').run(conn)
            });
            r.tableCreate('users').run(conn)
            r.tableCreate('groups').run(conn)
        });    
    };
}
module.exports.r = r

// r.connect(config.rethinkdb.host, config.rethinkdb.port)
//   .then(async(connection) => {
//     conn = connection
//     if(connection.db == null || r.dbList().run == 0) {
//       let createDb = await r.dbCreate(config.rethinkdb.db).run(conn)
//       console.log(`Database ${config.rethinkdb.db} is successfully created!`);
//       return createDb
//     }
//   })
//   .then(_ => {
//     let createUser = r.db(config.rethinkdb.db).tableCreate('users').run(conn)
//     return createUser
//   })
//   .then(_ => {
//     let createGroup = r.db(config.rethinkdb.db).tableCreate('groups').run(conn)
//     return createGroup
//   })
//   .then(_ => {
//     let createUserGroup = r.db(config.rethinkdb.db).tableCreate('userGroups').run(conn)
//     return createUserGroup
//   })
//   .catch(err => console.log(err))
//   .finally(() => process.exit(0));