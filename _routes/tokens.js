/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const router = require('express').Router();
const users = require('../_utilities/users');
const tokens = require('../_utilities/tokens');

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
router.get('/', function(req, res) {
    // Find all tokens
    tokens.getTokens({})
        .then( tokens => {
            // Return tokens
            return res.status(200).json({ success: true, tokens: tokens });
        })
        .catch( err => {
            // Return error
            return res.status(400).json({ success: false, error: err.message });
        });
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
        let token = await tokens.getTokens({refresh_token: req.cookies.testcookie}, [], true);

        // If no token is found, and is not expired or revoked
        if(!token || token.revoked || token.expires_at < Date.now()){
            // Return error
            return res.status(401).json({ success: false, error: 'Invalid refresh token.' });
        }

        // Find token user
        let user = await users.getUsers({_id: token.user_id}, ['-password', '-salt'], true);

        // Return tokens
        return res.status(200).json({ success: true, token: token, user: user });
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
