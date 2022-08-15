/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

/**
*
* Generate JWT
* Create Json Web Token via supplied object as parameter.
*
* @param args.sub: String
* @param args.hash: String
* @param args.expiresIn: Number
*
**/
const generateJWT = (args) => {
    // Signed token variable
    let signedToken;

    // Create payload object
    const payload = {
        // Subject
        sub: args.sub,
        // Unique ID
        jti: args.hash,
        // Issued date
        iat: Date.now()
    };

    // Create options object
    let options = {
        // Expiration data
        expiresIn: (args.expiresIn ? args.expiresIn : (86400 * 1000)), // Default 1 day from issue
        // Desired algorithm (must match parser)
        algorithm: 'RS256'
    };

    // Try to generate new JWT
    try{

        // Generate signed token
        signedToken = jsonwebtoken.sign(payload, fs.readFileSync(process.env.KEY_PRIV_PATH, 'utf8'), options);

    } catch(e) {

        // Set token to false
        signedToken = false;
        // Set expires to null
        options.expiresIn = null;
    }

    // Return token object
    return {
        token: signedToken,
        created: payload.iat,
        expires: payload.iat + options.expiresIn
    };
}

/**
*
* Parse JWT
* Read Json Web Token and return token object.
*
* @param token: String
*
**/
const parseJWT = async (token) => {
    // Replace token prefix
    token = token.replace('Bearer ', '');
    // Decode token
    let tokenObj = await jsonwebtoken.verify(token, fs.readFileSync(process.env.KEY_PUB_PATH, 'utf8'));
    // Return data
    return tokenObj;
}

/**
*
* Export
*
**/
module.exports = {
    generateJWT,
    parseJWT
};
