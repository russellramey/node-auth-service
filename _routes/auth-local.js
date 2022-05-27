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
        const userToken = await tokens.generateUserToken(user, req.headers['user-agent']);
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
        const userToken = await tokens.generateUserToken(user, req.headers['user-agent']);
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
 * Password reset token
 * Request password reset token for user
 * Method: POST
 * URI: /auth/local/password-token
 * @param req.email: String
 * @return token: Object
 *
 **/
 router.post('/local/password-token', async function(req, res) {

    // If email is not present
    if(!req.body.email){
        // Return error
        return res.status(400).json({ success: false, error: '[email] parameter is required.' });
    }

    try {

        // find user
        const user = await users.getUsers({ email: req.body.email }, [], true);
        // If no user is found
        if(!user){
            // Return error
            return res.status(401).json({ success: false, error: 'Not authorized.' });
        }

        // Create new Token object
        const passwordToken = await tokens.generatePasswordToken(user, req.headers['user-agent']);
        // If no userToken, or refresh token
        if(!passwordToken){
            return res.status(400).json({ success: false, message: "Failed to save Token object." });
        }

        // Return success
        return res.status(200).json({ success: true, token: passwordToken.token });

    } catch (e){

        // Return error
        return res.status(400).json({ success: false, error: e.message });

    }
});

/**
 *
 * Password reset
 * Reset user password via password reset token
 * Method: POST
 * URI: /auth/local/password-reset
 * @param req.password: String
 * @param req.token: Stirng
 * @return Boolean
 *
 **/
 router.post('/local/password-reset', async function(req, res) {

    // If email is not present
    if(!req.body.password || !req.body.token){
        // Return error
        return res.status(400).json({ success: false, error: 'Bad request: invalid post body.' });
    }

    try {

        // Parse token param
        let token_id = req.body.token.split('-')[0];
        let token_hash = req.body.token.split('-')[1];

        // Find Token object
        const Token = await tokens.getTokens({ _id: token_id }, [], true);
        if(!Token || Token.revoked || Token.expires_at < Date.now() || token_hash !== hash.hashString(Token.id.toString(), Token.user.id.toString()).hash){
            return res.status(400).json({ success: false, message: 'Bad request: invalid reset token.' });
        };
       
        // Set and save new password for user
        Token.user.password = hash.hashString(req.body.password, Token.user.salt).hash
        Token.user.save()
        // Revoke current token
        Token.revoked = true;
        Token.save()

        // Return success
        return res.status(200).json({ success: true, message: 'Password has been reset.' });

    } catch (e){

        // Return error
        return res.status(400).json({ success: false, error: e.message });

    }
});

/**
 *
 * Export
 *
 **/
module.exports = router;
