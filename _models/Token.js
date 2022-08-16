/*jshint esversion: 8*/
/**
 *
 * Dependencies
 *
 **/
const mongoose = require('mongoose');
const Token = mongoose.model('Token');
const hash = require('../_utilities/hash');
const jwt = require('../_utilities/jwt');

/**
 *
 * Create new token object
 * Create a new user from User Model.
 * @param user: Object
 * @param refresh: Boolean
 * @return Object
 **/
const newToken = (user, refresh=true) => {

    // Validate user params
    if (!user || !user._id || !user.salt) {
        return false;
    }

    // Create new token model object
    const token = new Token({
        // User id
        user: user._id,
        // If refresh param true, create unique refresh token
        refresh_token: (refresh ? hash.hashString(Date.now().toString(), user.salt).hash : null),
        refresh_id: null,
        // Expiration datetime
        expires_at: Date.now() + (259200 * 1000), // 3 days from now
    });

    // Return data
    return token;
};

/**
 *
 * Generate User Token
 * Create new token object and encode as JWT.
 * @param user: Object
 * @return Object
 **/
const generateUserToken = async (user) => {

    // Create new Token object
    const userToken = newToken(user);
    // If no userToken or no userToken ID
    if(!userToken || !userToken._id) return false;

    // Update default object properties
    userToken.name = 'user_access_token'
    
    // Create new JWT from token model
    const jwtObject = await jwt.generateJWT({ sub: userToken.id, hash: hash.hashString(userToken.id.toString(), user.id.toString()).hash });
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
 * Generate Passowrd Token
 * Create new token object for password resets.
 * @param user: Object
 * @return Object
 **/
 const generatePasswordToken = async (user) => {

    // Create new Token object, no refresh token
    const passwordToken = newToken(user, false);
    // If no userToken or no userToken ID
    if(!passwordToken || !passwordToken._id) return false;

    // Update default object properties
    passwordToken.name = 'password_reset_token'
    passwordToken.expires_at = Date.now() + (900 * 1000), // 15 mins from now

    // Save Token
    await passwordToken.save();

    // Create new JWT from token model
    const jwtObject = await jwt.generateJWT({ sub: passwordToken.id, expiresIn: 900000 });
    // If JWT was not created
    if (!jwtObject.token) return false;

    // Return data
    return {
        ...passwordToken._doc,
        token: jwtObject.token
    };
};

/**
 *
 * Generate Refresh token
 * Create new token, revoke current token.
 * @param currentToken: Object
 * @return Object
 **/
const refreshToken = async (currentToken) => {
    // Create new token to replace current token
    const refreshToken = await generateUserToken(currentToken.user);
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
 * @return Object
 **/
const revokeToken = async (token) => {
    // If no token passed
    if(!token) return false;

    // Decode token
    token = await jwt.parseJWT(token);
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
 * Query for Tokens
 * Find and return tokens in database.
 * @param query: Object
 * @param keys: Array
 * @param findOne: Boolean
 * @return Array | Object
 **/
 const getTokens = async (query={}, keys=[], findOne=false) => {

    // Tokens placeholder
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
 * Export
 *
 **/
module.exports = {
    newToken,
    generateUserToken,
    generatePasswordToken,
    refreshToken,
    revokeToken,
    getTokens
};
