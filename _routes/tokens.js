/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const router = require('express').Router();
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
 * Export
 *
 **/
module.exports = router;
