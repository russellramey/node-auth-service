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
// User
router.use('/users', require('./users'));
// Wildcard
router.use('*', require('./404'));

/**
*
* Export
*
**/
module.exports = router;
