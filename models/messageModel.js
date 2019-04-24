/**
 * Global Variables
 */
let config = require('../config');
let model = module.exports;
let r = require('rethinkdb');

/**
 * Insert User ID & Group ID, Message
 * @param {FK's from user&groups, message body} document 
 * @param {response, error} callback 
 */
model.saveMessage = (document, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('messages').insert(document).run(conn).then((result) => {
            callback(result)
        }).error((error) => {
            callback(error)
        })
    }).error((error) => {
        callback(false, error)
    })
}

model.getMessage = (id, callback) => {
    r.connect(config.rethinkdb).then((conn) => {
        r.table('messages').get(id).run(conn).then((result) => {
            callback(result)
        }).error((error) => {
            callback(error)
        })
    }).error((error) => {
        callback(error)
    })
}