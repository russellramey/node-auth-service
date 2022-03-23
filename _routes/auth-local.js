/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const router = require('express').Router();
const users = require('../_models/UserController');
const tokens = require('../_models/TokenController');
// const hash = require('../_utilities/hash');
// const jwt = require('../_utilities/jwt');

/**
 *
 * Create new user
 * Add user to database
 * @param req: Request object
 * @param res: Response object
 * @return res: Response object
 *
 **/
const createUser = async (req, res) => {
    // Create new user object
    const user = users.newUser(req.body);

    try{

        // Save new user
        await user.save();

        // Create new Token object
        const userToken = await tokens.generateToken(user, req.headers['user-agent']);
        // If no userToken, or refresh token
        if(!userToken || !userToken.refresh_token){
            return res.status(400).json({ success: false, message: "Failed to save Token object." });
        }

        // Set refresh token cookie
        res.cookie('testcookie', userToken.refresh_token, {
           httpOnly: true,
           sameSite: 'none',
           secure: false
        });

        // Return success with user
        return res.json({ success: true, auth: userToken.jwt });

    } catch(e){

        // Return error
        return res.status(400).json({ success: false, error:'createUser: ' + e.message });

    }
};

/**
 *
 * Authenticate user
 * Issue new access token (jwt) via Email/Password
 * @param req.email: String
 * @param req.password: String
 * @return auth: Object
 *
 **/
const authenticateUser = async (req, res) => {
    try {

        // Authenticate user
        const user = await users.authenticateUser(req.body);
        // If user is not authenticated
        if(!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // Create new Token object
        const userToken = await tokens.generateToken(user, req.headers['user-agent']);
        // If no userToken, or refresh token
        if(!userToken || !userToken.refresh_token){
            return res.status(400).json({ success: false, message: "Failed to save Token object." });
        }

        // Set refresh token cookie
        res.cookie('testcookie', userToken.refresh_token, {
           httpOnly: true,
           sameSite: 'none',
           secure: false
        });

        // Return success
        return res.status(200).json({ success: true, auth: userToken.jwt });

    } catch (e) {

        // Return error
        return res.status(400).json({ success: false, error: 'authenticateUser: ' + e.message });

    }
};

/**
 *
 * Local Auth
 * Method: POST
 * URI: /auth/local
 * @return res: Object
 *
 **/
router.post('/local', function(req, res) {
    // If request inclues newUser parameter
    if(req.body.newUser === true){
        // Create new user
        return createUser(req, res);
    }
    // Authenticate existing user
    return authenticateUser(req, res);
});

/**
 *
 * Export
 *
 **/
module.exports = router;
