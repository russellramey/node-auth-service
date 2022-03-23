/*jshint esversion: 8*/
/**
 *
 * Dependencies
 *
 **/
const mongoose = require('mongoose');
const User = mongoose.model('User');
const hash = require('../_utilities/hash');

/**
 *
 * Create new user object
 * Create a new user from User Model.
 * @param data: Object
 * @return user: Object
 **/
const newUser = (data) => {

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
};

/**
 *
 * Query for users
 * Find and return users in database.
 * @param query: Object
 * @param keys: Array
 * @param findOne: Boolean
 * @return users: Array | Object
 **/
const getUsers = async (query={}, keys=[], findOne=false) => {

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
};

/**
 *
 * Authenticate user
 * Validate user email and password.
 * @param data: Object
 * @return user: Object || Boolean
 **/
const authenticateUser = async (data) => {
    // Validate required paramters
    if(!data || !data.password || !data.email) return false;

    // Find user by email
    const user = await getUsers({ email: data.email }, [], true);
    // If no user is found, or no password in request
    if(!user || user.provider.name !== 'local') return false;

    // Check req.password hash matches found user passowrd hash
    const isValidPass = hash.compareHashString(data.password, user.password, user.salt);
    // If password is not valid
    if (!isValidPass) return false;

    // Return data
    return user;
};

/**
 *
 * Export
 *
 **/
module.exports = {
    newUser,
    getUsers,
    authenticateUser
};
