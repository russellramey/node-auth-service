/*jshint esversion: 8*/
/**
 *
 * Dependencies
 *
 **/
const mongoose = require('mongoose');
const hash = require('../_utilities/hash');
const User = mongoose.model('User');

/**
 *
 * Create new user object
 * Create a new user from User Model.
 * @param data: Object
 * @return user: Object
 **/
function newUser(data) {

    // Validate data params
    if (!data || !data.email || !data.password) {
        return false;
    }

    // Hash password string
    let password = hash.hashString(data.password);

    // Create new user model object
    const user = new User({
        username: data.username,
        password: password.hash,
        salt: password.salt,
        email: data.email,
        scopes: ['user']
    });

    // Return user
    return user;
}

/**
 *
 * Query for users
 * Find and return users in database.
 * @param query: Object
 * @param keys: Array
 * @param findOne: Boolean
 * @return users: Array | Object
 **/
async function getUsers(query={}, keys=[], findOne=false){

    // Users placeholder
    let users = [];

    // If single is true
    if(findOne){
        // Awiat for query
        users = await User.findOne(query).select(keys);
    } else {
        // Awiat for query
        users = await User.find(query).select(keys);
    }

    // Find multiple users based on params
    return users;
}

/**
 *
 * Export
 *
 **/
module.exports = {
    newUser,
    getUsers
};
