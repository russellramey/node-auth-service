/*jshint esversion: 8*/
/**
 *
 * Dependencies
 *
 **/
const mongoose = require('mongoose');
const Token = mongoose.model('Token');
const hash = require('../_utilities/hash');
const client = require('../_utilities/client');

/**
 *
 * Create new token object
 * Create a new user from User Model.
 * @param user: Object
 * @param agent: Object / String
 * @return Object: token
 **/
const newToken = (user, agent) => {

    // Validate user params
    if (!user || !user._id || !user.salt || !agent) {
        return false;
    }

    // Create new token model object
    const token = new Token({
        user: user._id,
        client: client.parseUserAgent(agent),
        refresh_token: hash.hashString(Date.now().toString(), user.salt).hash,
        refresh_id: null,
        expires_at: Date.now() + (259200 * 1000), // 3 days from now
    });

    // Return data
    return token;
};

/**
 *
 * Query for Tokens
 * Find and return tokens in database.
 * @param query: Object
 * @param keys: Array
 * @param findOne: Boolean
 * @return tokens: Array | Object
 **/
const getTokens = async (query={}, keys=[], findOne=false) => {

    // Users placeholder
    let tokens;

    // If single is true
    if(findOne){
        // Find single token, return with User object
        tokens = await Token.findOne(query).populate('user').select(keys);
    } else {
        // Find all tokens
        tokens = await Token.find(query).populate('user').select(keys);
    }

    // Return data
    return tokens;
};

/**
 *
 * Generate Refresh token
 * Create new token, revoke current token.
 * @param currentToken: Object
 * @param client: String
 * @return refreshToken: Object
 **/
const refreshToken = async (currentToken, client) => {
    // Create new token to replace current token
    const refreshToken = newToken(currentToken.user, client);

    // Update current token
    currentToken.revoked = true; // Revoke current token
    currentToken.refresh_id = refreshToken._id; // Update current token with refreshed id
    // Save current token
    await currentToken.save();

    // Return refreshToken
    return refreshToken;
};



/**
 *
 * Export
 *
 **/
module.exports = {
    newToken,
    getTokens,
    refreshToken
};
