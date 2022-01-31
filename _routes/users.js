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
            res.status(200).json(users);
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
router.post('/token', function(req, res) {
    User.findOne({ email: req.body.email }).then( user => {
        // If no user is found, or no password in request
        if(!user || !req.body.password) {
            return res.status(401).json({ success: false, msg: "Invalid credentials" });
        }

        // Check password is valid
        const isValid = hashs.compareHashString(req.body.password, user.password, user.salt);

        // If password is valid
        if (isValid) {

            // Create new token object
            const userToken = new Token({
                hash: hashs.hashString(Date.now().toString(), user.salt).hash,
                user_id: user._id,
                client: client.parseUserAgent(req.headers['user-agent'])
            });

            // Create new JWT from token object
            const jwtObject = jwt.generateJWT(userToken);

            // If JWT was created successfully
            if(jwtObject.token){

                // Update timestamps
                userToken.created_at = jwtObject.created;
                userToken.expires_at = jwtObject.expires;

                // Save token object
                userToken.save()
                    .then((token) => {
                        res.status(200).json({ success: true, result: jwtObject });
                    })
                    // Catch any errors
                    .catch((err) => {
                        // Bad request
                        res.status(400).json({ success: false, result: err });
                    });
            }

        } else {
            res.status(401).json({ success: false, msg: "Invalid credentials" });
        }

    });
});

// Create new user
router.post('/create', function(req, res) {

    // Create new user from request body
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        scopes: ['user']
    });

    // If password is present
    if(req.body.password){
        // Hash password
        let password = hashs.hashString(req.body.password);
        // Set password as hash
        newUser.password = password.hash;
        // Set password salt
        newUser.salt = password.salt;
    }

    // Try to save user
    try {
        // Save user object
        newUser.save()
            .then((user) => {
                // Successful request
                res.json({ success: true, user: user });
            })
            // Catch any errors
            .catch((err) => {
                // Bad request
                res.status(400).json({ success: false, result: err });
            });
        // Catch any errors
    } catch (err) {
        // Bad request
        res.status(400).json({ success: false, result: err });
    }
});

/**
 *
 * Export
 *
 **/
module.exports = router;
