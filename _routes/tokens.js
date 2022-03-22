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
        return res.status(400).json({ success: false, error: e.message });

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

        // Return tokens
        return res.status(200).json({ success: true, token: token, user: token.user });
    }
    // Catch error(s)
    catch (e) {
        // Return error
        return res.status(400).json({ error: true, message: e.message });
    }
});

/**
 *
 * Export
 *
 **/
module.exports = router;
