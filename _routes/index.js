/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const router = require('express').Router();

/**
*
* Route modules
*
**/
// Auth
router.use('/auth',[
    require('./auth-local')
]);
// User
router.use('/users', require('./users'));
// Tokens
router.use('/tokens', require('./tokens'));
// Wildcard
router.use('*', require('./404'));

/**
*
* Export
*
**/
module.exports = router;
