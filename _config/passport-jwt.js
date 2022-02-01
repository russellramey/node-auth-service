/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const passportjwt = require('passport-jwt');
const fs = require('fs');
const users = require('../_utilities/users');
const tokens = require('../_utilities/tokens');
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
    passport.use(new passportjwt.Strategy(options, function(jwt_payload, done){
        // Find token
        tokens.getTokens({ _id: jwt_payload.sub }, [], true)
            .then( token => {
                // If Token is found, and is valid
                if (token && !token.revoked && (token.hash === jwt_payload.jti)) {
                    // Find user
                    users.getUsers({_id: token.user_id}, ['-password', '-salt'], true)
                        .then( user => {

                            // If user is found
                            if(user){
                                // Return user and token objects
                                return done(null, { user, token });
                            }

                            // Return false
                            return done(null, false);
                        })
                        .catch( err => {
                            return done(err, false);
                        });

                } else {
                	// Return false
                    return done(null, false);
                }
            })
            .catch( error => {
                return done(error, false);
            });

    }));
};
