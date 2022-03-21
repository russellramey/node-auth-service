/*jshint esversion: 8*/
/**
 *
 * Dependencies
 *
 **/
const mongoose = require('mongoose');
const hash = require('../_utilities/hash');
const client = require('../_utilities/client');
const Token = mongoose.model('Token');

/**
 *
 * Create new token object
 * Create a new user from User Model.
 * @param user: Object
 * @param agent: Object / String
 * @return Object: token
 **/
function newToken(user, agent) {

    // Validate user params
    if (!user || !user._id || !user.salt || !agent) {
        return false;
    }

    // Create new token model object
    const token = new Token({
        user_id: user._id,
        client: client.parseUserAgent(agent),
        refresh_token: hash.hashString(Date.now().toString(), user.salt).hash,
        refresh_id: null,
        expires_at: Date.now() + (259200 * 1000), // 3 days from now
    });

    // Return data
    return token;
}

/**
 *
 * Query for Tokens
 * Find and return tokens in database.
 * @param query: Object
 * @param keys: Array
 * @param findOne: Boolean
 * @return tokens: Array | Object
 **/
async function getTokens(query={}, keys=[], findOne=false){

    // Users placeholder
    let tokens;

    // If single is true
    if(findOne){
        // Awiat for query
        tokens = await Token.findOne(query).select(keys);
    } else {
        // Awiat for query
        tokens = await Token.find(query).select(keys);
    }

    // Return data
    return tokens;
}

/**
 *
 * Export
 *
 **/
module.exports = {
    newToken,
    getTokens
};
