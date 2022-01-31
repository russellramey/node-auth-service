/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const passport = require('passport');
const mongoose = require('mongoose');
const router = require('express').Router();
const hashs = require('../_utilities/hash');
const jwt = require('../_utilities/jwt');
const client = require('../_utilities/client');
const User = mongoose.model('User');
const Token = mongoose.model('Token');

/**
 *
 * Routes
 * All below routes are prefixed with '/users/*'
 *
 **/
// User List
// Returns all users
router.get('/list', function(req, res) {
    // Find all users
    // Remove passowrds and salt keys
    User.find({}).select(['-password', '-salt'])
        .then(users => {
            // Return all users
            return res.status(200).json(users);
        });
});

// User Profile
// Return single user profile from provided JWT
router.get('/me', function(req, res) {
    // Authenticate request, Passport Middleware
    passport.authenticate('jwt', { session: false }, function(err, auth, info) {

        // If no user, or unauthorized
        if(!auth || !auth.user) {
            // Return error
            return res.status(401).json({ success: false, error: true, message: 'Invalid token' });
        }

        // Return user
        return res.status(200).json({ success: true, user: auth.user });

    })(req, res);
});

// Get user token
// Issue new access token (jwt) to user
router.post('/token', function(req, res) {
    // Find single user by email
    User.findOne({ email: req.body.email }).then( user => {
        // If no user is found, or no password in request
        if(!user || !req.body.password) {
            return res.status(401).json({ success: false, msg: "Invalid credentials" });
        }

        // Check req.password hash matches found user passowrd hash
        const isValidPass = hashs.compareHashString(req.body.password, user.password, user.salt);

        // If password is valid
        if (isValidPass) {

            // Create new token object
            const userToken = new Token({
                hash: hashs.hashString(Date.now().toString(), user.salt).hash,
                user_id: user._id,
                client: client.parseUserAgent(req.headers['user-agent'])
            });

            // Create new JWT from userToken object
            const jwtObject = jwt.generateJWT(userToken);

            // If JWT was created successfully
            if(jwtObject.token){

                // Update timestamps on userToken to match JWT timestamps
                userToken.created_at = jwtObject.created;
                userToken.expires_at = jwtObject.expires;

                // Save userToken object
                userToken.save()
                    .then((token) => {
                        // Return success with token
                        return res.status(200).json({ success: true, result: jwtObject });
                    })
                    .catch((err) => {
                        // Return error
                        return res.status(400).json({ success: false, result: err });
                    });
            }

        } else {
            // Return error
            return res.status(401).json({ success: false, msg: "Invalid credentials" });
        }

    });
});

// Create new user
// Add user to database
router.post('/create', function(req, res) {

    // Create new user from request body
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        scopes: ['user']
    });

    // If password is present
    if(req.body.password){
        // Hash req.password string
        let password = hashs.hashString(req.body.password);
        // Set password hash string
        newUser.password = password.hash;
        // Set password salt string
        newUser.salt = password.salt;
    }

    // Try to save user
    try {
        // Save user object
        newUser.save()
            .then((user) => {
                // Return success with user
                return res.json({ success: true, user: user });
            })
            .catch((err) => {
                // Return error
                return res.status(400).json({ success: false, result: err });
            });
        // Catch any errors
    } catch (err) {
        // Bad request
        return res.status(400).json({ success: false, result: err });
    }
});

/**
 *
 * Export
 *
 **/
module.exports = router;
