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
const jwt = require('../_utilities/jwt');

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
 * Generate User Token
 * Create new token object and encode as JWT.
 * @param user: Object
 * @param client: String
 * @return userToken: Object
 **/
const generateToken = async (user, client) => {

    // Create new Token object
    const userToken = newToken(user, client);
    // If no userToken or no userToken ID
    if(!userToken || !userToken._id) return false;

    // Create new JWT from token model
    const jwtObject = jwt.generateJWT(userToken);
    // If JWT was not created
    if (!jwtObject.token) return false;

    // Save Token
    await userToken.save();

    // Return data
    return {
        ...userToken._doc,
        jwt: jwtObject
    };
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
    const refreshToken = await generateToken(currentToken.user, client);
    // If no refreshToken
    if(!refreshToken) return false;

    // Update current token properties
    currentToken.revoked = true; // Revoke current token
    currentToken.refresh_id = refreshToken._id; // Update current token with refreshed id
    // Save current token
    await currentToken.save();

    // Return refreshToken
    return refreshToken;
};

/**
 *
 * Revoke token
 * Create new token, revoke current token.
 * @param token: String
 * @return token: Object
 **/
const revokeToken = async (token) => {
    // If no token passed
    if(!token) return false;

    // Decode token
    token = jwt.parseJWT(token);
    // If no token does not parse
    if(!token || !token.sub) return false;

    // Find current token object
    const tokenObj = await getTokens({_id: token.sub}, [], true);
    // If no token object, or not valid
    if(!tokenObj || tokenObj.revoked) return false;

    // Set token property
    tokenObj.revoked = true;
    // Save current token
    await tokenObj.save();

    // Return refreshToken
    return tokenObj;
};

/**
 *
 * Export
 *
 **/
module.exports = {
    newToken,
    getTokens,
    refreshToken,
    generateToken,
    revokeToken
};
