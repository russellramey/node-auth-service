/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const passportjwt = require('passport-jwt');
const User = require('mongoose').model('User');
const Token = require('mongoose').model('Token');
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
    passport.use(new passportjwt.Strategy(options, function(jwt_payload, done){

        // Find Token from JWT payload id
        Token.findOne({_id: jwt_payload.sub}, function(err, token){

            // If any error
            if (err) {
            	// Return error
                return done(err, false);
            }
            // If Token is found, and is valid
            if (token && !token.revoked && (token.hash === jwt_payload.jti)) {

                // Find user from Token.user_id
                User.findOne({_id: token.user_id}, function(err, user){

                    // If any error
                    if (err) {
                    	// Return error
                        return done(err, false);
                    }

                    // If user is found
                    if(user){
                        // Return user and token objects
                        return done(null, { user, token });
                    }

                    // Return false
                    return done(null, false);

                }).select(['-password', '-salt']); // Remove password and salt keys

            } else {
            	// Return false
                return done(null, false);
            }
        });

    }));
};
