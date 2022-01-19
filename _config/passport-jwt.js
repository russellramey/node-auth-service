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
  jwtFromRequest: passportjwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: fs.readFileSync(process.env.PUB_KEY_PATH, 'utf8'),
  algorithms: ['RS256']
};

/**
*
* Passport Strategy
*
**/
// Global passport object passed from main app config
module.exports = (passport) => {
    // The JWT payload is passed into the verify callback
    passport.use(new passportjwt.Strategy(options, function(jwt_payload, done){

    	// Debug
        // console.log(jwt_payload);

        // Lookup user from token payload id
        Token.findOne({_id: jwt_payload.sub}, function(err, token){

            // If any error
            if (err) {
            	// Return error
                return done(err, false);
            }
            // If user is found
            if (token && (token.hash === jwt_payload.jti)) {


                User.findOne({_id: token.user_id}, function(err, user){

                    // If any error
                    if (err) {
                    	// Return error
                        return done(err, false);
                    }
                    if(user){
                        // Return user object
                        return done(null, user);
                    }

                    // Return false
                    return done(null, false);
                }).select(['-password', '-salt']);


            } else {
            	// Return false
                return done(null, false);
            }
        });

    }));
}
