/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const passport = require('passport');
const router = require('express').Router();
const users = require('../_models/UserController');

/**
 *
 * List users
 * List all users from database
 * Method: GET
 * URI: /users
 * @param null
 * @return users: Array
 *
 **/
router.get('/', async function(req, res) {
    try {

        // Find all users
        let userArr = await users.getUsers({}, ['-password', '-salt']);
        // Return users
        return res.status(200).json({ success: true, users: userArr });

    } catch (e){

        // Return error
        return res.status(400).json({ success: false, error: e.message });

    }
});

/**
 *
 * User profile
 * Return single user profile from valid JWT
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
 * Export
 *
 **/
module.exports = router;
