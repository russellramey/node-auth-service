/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
*
* Generate JWT
* Create Json Web Token via supplied object as parameter.
*
* @param obj: Object
*
**/
function generateJWT(obj) {
    // Signed token variable
    let signedToken;

    // Create payload object
    const payload = {
        sub: obj._id,
        jti: obj.hash,
        iat: Date.now()
    };

    // Create options object
    let options = {
        expiresIn: (604800 * 1000), // 7 days from issue
        algorithm: 'RS256',
        // message: null
    };

    // Try to generate new JWT
    try{

        // Generate signed token
        signedToken = jsonwebtoken.sign(payload, fs.readFileSync(process.env.PRIV_KEY_PATH, 'utf8'), options);

    } catch(e) {

        // Set token to false
        signedToken = false;
        // Set expires to null
        options.expiresIn = null;
        // Set error message
        options.message = e;
    }

    // Return token object
    return {
        token: signedToken,
        created: payload.iat,
        expires: payload.iat + options.expiresIn,
        message: options.message
    };
}

/**
*
* Export
*
**/
module.exports = {
    generateJWT
};
