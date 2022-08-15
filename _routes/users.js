/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const passport = require('passport');
const router = require('express').Router();
const User = require('../_models/User');

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
        const userArr = await User.getUsers({}, ['-password', '-salt']);
        // Return users
        return res.status(200).json({ success: true, users: userArr });

    } catch (e){

        // Return error
        return res.status(400).json({ success: false, error: e.message });

    }
});

/**
 *
 * Authenticated user
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
        if(!auth || !auth.token) {
            // Return error
            return res.status(401).json({ success: false, error: 'Invalid token.' });
        }

        // Return user
        return res.status(200).json({ success: true, user: auth.token.user });

    })(req, res);
});

/**
 *
 * Single user
 * Return single user object
 * Method: GET
 * URI: /users/:userid
 * @param userid: String
 * @return user: Object
 *
 **/
router.get('/:userid', async function(req, res) {

    // If no userid
    if(!req.params.userid){
        return res.status(400).json({error: true, message: 'Invalid user id.'});
    }

    try{

        // Find all users
        const user = await Token.getUsers({_id: req.params.userid}, ['-password', '-salt'], true);

        // If no user
        if(!user){
            return res.status(400).json({error: true, message: 'Invalid user id.'});
        }

        // Return users
        return res.status(200).json({ success: true, user: user });

    } catch (e){

        // Return error
        return res.status(400).json({ error: true, message: 'Invalid user id.' });

    }

});

/**
 *
 * Export
 *
 **/
module.exports = router;
