/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const router = require('express').Router();
const User = require('../_models/User');
const Token = require('../_models/Token');
const hash = require('../_utilities/hash');
const cookie = require('../_utilities/cookie');
const jwt = require('../_utilities/jwt');
require('dotenv').config();

/**
 *
 * Local Auth
 * Method: POST
 * URI: /auth/local
 * @param req.body: Object
 * @return Object
 *
 **/
router.post('/local', async function(req, res) {

    try{

        // If newUser request
        if(req.body.newUser === true){
            // Create new user object
            user = await User.newUser(req.body);
        } else {
            // Authenticate existing user
            user = await User.authenticateUser(req.body);
        }

        // If no user
        if(!user) return res.status(401).json({ success: false, message: 'Invalid credentials.'}); 

        // Create new Token object
        const userToken = await Token.generateUserToken(user);
        // If no userToken, or refresh token
        if(!userToken || !userToken.refresh_token) return res.status(400).json({ success: false, message: "Failed to generate Token object." });

        // Set refresh token cookie
        const cookieObj = await cookie.generateCookie( {name: process.env.REFRESH_TOKEN_NAME, value: userToken.refresh_token })
        res.cookie(cookieObj.name, cookieObj.value, cookieObj.options);

        // Return success
        return res.status(200).json({ 
            success: true, 
            auth: {
                ...userToken.jwt, 
                refresh_token: userToken.refresh_token
            } 
        });
        
    } catch (e){

        // Return error
        return res.status(400).json({ success: false, message: e.message });

    }
    
});

/**
 *
 * Password reset token
 * Request password reset token for user
 * Method: POST
 * URI: /auth/local/password-token
 * @param req.email: String
 * @return Object
 *
 **/
 router.post('/local/password-token', async function(req, res) {

    // If email is not present
    if(!req.body.email){
        // Return error
        return res.status(400).json({ success: false, message: '[email] parameter is required.' });
    }

    try {

        // find user
        const user = await User.getUsers({ email: req.body.email }, [], true);
        // If no user is found
        if(!user) return res.status(401).json({ success: false, message: 'Not authorized.' });

        // Create new Token object
        const passwordToken = await Token.generatePasswordToken(user);
        // If no userToken, or refresh token
        if(!passwordToken) return res.status(400).json({ success: false, message: "Failed to save Token object." });

        // Return success
        return res.status(200).json({ success: true, token: passwordToken.token });

    } catch (e){

        // Return error
        return res.status(400).json({ success: false, message: e.message });

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
 * @return Object
 *
 **/
 router.post('/local/password-reset', async function(req, res) {

    // If email is not present
    if(!req.body.password || !req.body.token){
        // Return error
        return res.status(400).json({ success: false, error: 'Bad request: invalid post body.' });
    }

    try {

        // Verify / Decode token
        let tokenObj = await jwt.parseJWT(req.body.token)

        // Find Token object
        const token = await Token.getTokens({ _id: tokenObj.sub }, [], true);
        if(!token || token.revoked || token.expires_at < Date.now()){
            return res.status(400).json({ success: false, message: 'Bad request: invalid reset token.' });
        };
       
        // Set and save new password for user
        token.user.password = hash.hashString(req.body.password, token.user.salt).hash
        await token.user.save()
        // Revoke current token
        token.revoked = true;
        await token.save()

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
