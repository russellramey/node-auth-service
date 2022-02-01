/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const passport = require('passport');
const router = require('express').Router();
const hash = require('../_utilities/hash');
const users = require('../_utilities/users');
const tokens = require('../_utilities/tokens');

/**
 *
 * List users
 * List all users from database
 * Method: GET
 * URI: /users/list
 * @param null
 * @return users: Array
 *
 **/
router.get('/list', function(req, res) {
    // Find all users
    users.getUsers({}, ['-password', '-salt'])
        .then( users => {
            // Return users
            return res.status(200).json({ success: true, users: users });
        })
        .catch( err => {
            // Return error
            return res.status(400).json({ success: false, error: err });
        });
});

/**
 *
 * User Profile
 * Return single user profile from provided JWT
 * Method: GET
 * URI: /users/me
 * @param token: String
 * @return user: Object
 *
 **/
router.get('/me', function(req, res) {
    // Authenticate request, Passport Middleware
    passport.authenticate('jwt', { session: false }, function(err, auth, info) {

        // If no user, or unauthorized
        if(!auth || !auth.user) {
            // Return error
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        // Return user
        return res.status(200).json({ success: true, user: auth.user });

    })(req, res);
});

/**
 *
 * Issue user token
 * Issue new access token (jwt) to user
 * Method: POST
 * URI: /users/token
 * @param email: String
 * @param password: String
 * @return token: Object
 *
 **/
router.post('/token', function(req, res) {
    // Find single user by email
    users.getUsers({ email: req.body.email }, [], true)
        .then( user => {
            // If no user is found, or no password in request
            if(!user || !req.body.password) {
                return res.status(401).json({ success: false, msg: "Invalid credentials" });
            }

            // Check req.password hash matches found user passowrd hash
            const isValidPass = hash.compareHashString(req.body.password, user.password, user.salt);

            // If password is valid
            if (isValidPass) {

                // Create new token object
                const userToken = tokens.newToken(user, req.headers['user-agent']);

                // Save userToken object
                userToken.token.save()
                    .then((token) => {
                        // Return success with token
                        return res.status(200).json({ success: true, result: userToken.jwt });
                    })
                    .catch((err) => {
                        // Return error
                        return res.status(400).json({ success: false, error: err });
                    });

            } else {
                // Return error
                return res.status(401).json({ success: false, error: "Invalid credentials" });
            }

        })
        .catch( err => {
            // Return error
            return res.status(400).json({ success: false, error: err });
        });
});

/**
 *
 * Revoke user token
 * Method: GET
 * URI: /users/token/revoke
 * @param token: String
 * @return token: Object
 *
 **/
router.get('/token/revoke', function(req, res) {
    // Authenticate request, Passport Middleware
    passport.authenticate('jwt', { session: false }, function(err, auth, info) {

        // If no user, or unauthorized
        if(!auth || !auth.user) {
            // Return error
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        // Set token revoked to true
        auth.token.revoked = true;
        // Save updated token
        auth.token.save()
            .then(token => {
                // Return token
                return res.status(200).json({ success: true, token: token });
            })
            .catch(err => {
                // Return error
                return res.status(400).json({ success: false, error: err });
            });

    })(req, res);
});

/**
 *
 * Create new user
 * Add user to database
 * Method: POST
 * URI: /users/create
 * @param username: String
 * @param email: String
 * @param password: String
 * @return user: Object
 *
 **/
router.post('/create', function(req, res) {

    // Create new user object
    const newUser = users.newUser(req.body);

    // Save user object
    newUser.save()
        .then((user) => {
            // Return success with user
            return res.json({ success: true, user: user });
        })
        .catch((err) => {
            // Return error
            return res.status(400).json({ success: false, error: err });
        });
});

/**
 *
 * Export
 *
 **/
module.exports = router;
