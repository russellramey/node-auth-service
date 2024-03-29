/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const passportjwt = require('passport-jwt');
const users = require('../_models/User');
const tokens = require('../_models/Token');
const hash = require('../_utilities/hash');
const fs = require('fs');
require('dotenv').config();

/**
*
* Setup / Config
*
**/
// Options object, matches same options as token issue method
const options = {
    // Authentication header bearer token from request
    jwtFromRequest: passportjwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    // Public key from keypair
    secretOrKey: fs.readFileSync(process.env.KEY_PUB_PATH, 'utf8'),
    // Encryption algorithum
    algorithms: ['RS256']
};

/**
*
* Passport JWT Strategy
*
**/
// Global passport object passed from main app config
module.exports = (passport) => {
    // The JWT payload is passed into the verify callback
    passport.use(new passportjwt.Strategy(options, async (jwt_payload, done) => {

        // If jwt is expired, or missing required params
        if(jwt_payload.exp < Date.now() || !jwt_payload.jti || !jwt_payload.sub) {
            return done(null, false);
        }

        try{
            // Find token
            const token = await tokens.getTokens({ _id: jwt_payload.sub }, [], true);

            // If no token, or token revoked
            if(!token || !token.user || token.revoked) return done(null, false);
            // If token expired or no hash (JTI)
            if((token.expires_at < Date.now()) ||  jwt_payload.jti !== hash.hashString(token.id.toString(), token.user.id.toString()).hash) return done(null, false);

            // Return user and token objects
            return done(null, { token });

        } catch (e) {

            // Return error
            return done(e, false);

        }

    }));
};
