/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const router = require('express').Router();
const users = require('../_models/UserController');
const tokens = require('../_models/TokenController');
const hash = require('../_utilities/hash');
const jwt = require('../_utilities/jwt');

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
    let user = users.newUser(req.body);

    try{

        // Save new user
        user = await user.save();
        // Return success with user
        return res.json({ success: true, user: user });

    } catch(e){

        // Return error
        return res.status(400).json({ success: false, error: e.message });

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
        // Find user by email
        let user = await users.getUsers({ email: req.body.email }, [], true);

        // If no user is found, or no password in request
        if(!user || !req.body.password || user.provider.name !== 'local') {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Check req.password hash matches found user passowrd hash
        const isValidPass = hash.compareHashString(req.body.password, user.password, user.salt);

        // If password is not valid
        if (!isValidPass) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Create new token object
        const userToken = tokens.newToken(user, req.headers['user-agent']);
        // Save token
        let token = await userToken.save();

        // If no user is found, or no password in request
        if(!token || !token._id) {
            return res.status(400).json({ success: false, message: "Failed to save Token object." });
        }

        // Create new JWT from token model
        const jwtObject = jwt.generateJWT(token);

        // If JWT was created successfully
        if (!jwtObject.token) {
           // Return error
           return res.status(400).json({ success: false, error: 'Failed to generate JWT from Token object.' });
        }

        // Set refresh token cookie
        res.cookie('testcookie', token.refresh_token, {
           httpOnly: true,
           sameSite: 'none',
           secure: false
        });

        // Return success with token
        return res.status(200).json({ success: true, auth: jwtObject });

    } catch (e) {

        // Return error
        return res.status(400).json({ success: false, error: e.message });

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
