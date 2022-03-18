/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const express = require("express");
const passport = require('passport');
const cors = require("cors");

/**
*
* Config
*
**/
// Create the Express application
const app = express();

// Configure Express to use json as body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow cors headers for applicaiton
app.use(cors());
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
// Initialize Passport for use in application
app.use(passport.initialize());

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
