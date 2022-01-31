/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const mongoose = require('mongoose');
require('dotenv').config();

/**
*
* Database Connections
* Requires connection variables from .env:
* - DB_STRING
* - DB_STRING_PROD
**/
// Connection strings
const devConnection = process.env.DB_STRING;
const prodConnection = process.env.DB_STRING_PROD;

// Connect to the correct environment database
if (process.env.NODE_ENV === 'production') {

    // Mongoose connection to production string
    mongoose.connect(prodConnection, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    // When connection is successful
    mongoose.connection.on('connected', () => {
        console.log('Production database connection established');
    });

} else {

    // Mongoose connection to development string
    mongoose.connect(devConnection, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    // When connection is successful
    mongoose.connection.on('connected', () => {
        console.log('Database connection established');
    });

}
