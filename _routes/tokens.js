/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const router = require('express').Router();
const users = require('../_models/UserController');
const tokens = require('../_models/TokenController');

/**
 *
 * List tokens
 * List all tokens from database
 * Method: GET
 * URI: /tokens
 * @param null
 * @return tokens: Array
 *
 **/
router.get('/', async function(req, res) {
    try {

        // Find all users
        const tokenArr = await tokens.getTokens({}, ['-refresh_token']);
        // Return users
        return res.status(200).json({ success: true, tokens: tokenArr });

    } catch (e){

        // Return error
        return res.status(400).json({ success: false, error: 'getTokens: ' + e.message });

    }
});

/**
 *
 * Refresh token
 * Create new token based on refresh token
 * Method: POST
 * URI: /tokens/refresh
 * @param refres_token: String
 * @return token: Object
 *
 **/
router.post('/refresh', async function(req, res) {

    // If cookie does not exist
    if(!req.cookies && !req.cookies.testcookie){
        // Return error
        return res.status(400).json({ success: false, error: 'Invalid refresh token.' });
    }

    // Try
    try{
        // Find token from refresh token value
        const token = await tokens.getTokens({refresh_token: req.cookies.testcookie}, [], true);
        // If no token is found, and is not expired or revoked
        if(!token || !token.user || token.revoked || token.expires_at < Date.now()){
            // Return error
            return res.status(401).json({ success: false, error: 'Invalid refresh token.' });
        }

        // Create new token to replace current token
        const refreshToken = await tokens.refreshToken(token, req.headers['user-agent']);
        // If no token is found, and is not expired or revoked
        if(!refreshToken || !refreshToken.user){
            // Return error
            return res.status(400).json({ success: false, error: 'Token failed to generate from refresh token.' });
        }

        // Set refresh token cookie
        res.cookie('testcookie', refreshToken.refresh_token, {
           httpOnly: true,
           sameSite: 'none',
           secure: false
        });

        // Return tokens
        return res.status(200).json({ success: true, auth: refreshToken.jwt });
    }
    // Catch error(s)
    catch (e) {
        // Return error
        return res.status(400).json({ error: true, message: 'refreshToken: ' + e.message });
    }
});

/**
 *
 * Revoke token
 * Revoke / invalidate current token from header or post body
 * Method: POST
 * URI: /tokens/revoke
 * @param token: String
 * @return token: Object
 *
 **/
router.post('/revoke', async function(req, res) {
    // Token from header
    let token = req.headers.authorization;

    // If token req parameter exists
    // overwrite token variable from auth header
    if(req.body.token){
        token = req.body.token;
    }

    try{
        // Revoke current token
        token = await tokens.revokeToken(token);
        // If token is not valid
        if(!token){
            // Return error
            return res.status(400).json({error: true, message: 'Invalid token.'});
        }

        // Set refresh token cookie to null and expired
        res.cookie('testcookie', null, {
           httpOnly: true,
           sameSite: 'none',
           secure: false,
           expires: new Date(Date.now() - 3600)
        });

        // Return response
        return res.status(200).json({success: true, message: 'Token has been revoked.'});

    } catch (e){

        // Return error
        return res.status(400).json({error: true, message: 'revokeToken: ' + e.message});

    }
});



/**
 *
 * Export
 *
 **/
module.exports = router;
