/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require('passport');
const cors = require("cors");

/**
*
* Config
*
**/
// Create the Express application
const app = express();
// App configuration
app.use([
    cookieParser(), // Cookie parser
    express.json(), // Express json parser
    express.urlencoded({ extended: true }), // Express url parser
    passport.initialize(), // Passport support
    cors() // Cors headers
]);
// Remove eTag header, globally
app.set('etag', false);

/**
*
* Database
*
**/
require('./_config/database');

/**
*
* Models
*
**/
require('./_models');

/**
*
* Middleware
*
**/
// Local JWT - pass in global passport
require('./_config/passport-jwt')(passport);

/**
*
* Routes
*
**/
app.use(require('./_routes'));

/**
*
* Server
*
**/
app.listen(3000, () => {
    console.log("Service running on port 3000");
});
