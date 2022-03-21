/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const passportjwt = require('passport-jwt');
const users = require('../_models/UserController');
const tokens = require('../_models/TokenController');
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

        // If jwt is expired
        if(jwt_payload.exp < Date.now()) {
            return done(null, false);
        }

        try{
            // Find token
            let token = await tokens.getTokens({ _id: jwt_payload.sub }, [], true);

            // If no token, or token expired
            if(!token || token.revoked || (token.expires_at < Date.now())){
                return done(null, false);
            }

            // Find user associated to token
            let user = await users.getUsers({_id: token.user_id}, ['-password', '-salt'], true);

            // If no user or user id
            if(!user || !user._id){
                // Return false
                return done(null, false);
            }

            // Return user and token objects
            return done(null, { user, token });

        } catch (e) {

            // Return error
            return done(e, false);

        }

    }));
};
