/**
 * Global variables
 */
const db = require('../database')
let model = module.exports;

/**
 * Module Dependencies
 */
let r = require('rethinkdb');

/**
 * Insert User
 * @param {user document} user 
 */
model.saveUser = (user) => {
    return r.table('users').insert(user, {
        returnChanges: true
    }).run(db.conn)
}

/**
 * Get All User
 */
model.getUsers = () => {
    return r.table('users').coerceTo('array').run(db.conn)
}

/**
 * Get User by ID
 * @param {ID of the user} id 
 */
model.getUser = (id) => {
    return r.table('users').get(id).coerceTo('object').run(db.conn)
}

/**
 * Modify All Document of the User
 * @param {document from the client} user 
 * @param {ID of the user} id 
 */
model.updateUser = (user, id) => {
    return r.table('users').get(id).update(user, {
        returnChanges: true
    }).run(db.conn)
}

/**
 * Delete User by ID
 * @param {ID of the User} id 
 */
model.deleteUser = (id) => {
    return r.table('users').get(id).delete({
        returnChanges: true
    }).run(db.conn)
}