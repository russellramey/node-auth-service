/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const mongoose = require('mongoose');

/**
*
* Model Schema
*
**/
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [ true, 'username is required for User' ]
    },
    email: {
        type: String,
        unique: true,
        required: [ true, 'email is required for User' ]
    },
    password: {
        type: String,
        required: [ true, 'password is required for User' ]
    },
    provider: {
        type: Object,
        required: [ true, 'provider is required for User' ],
        default: {
            id: null,
            name: 'local'
        }
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    },
    email_valid: {
        type: Boolean,
        default: 0
    },
    salt: String,
    scopes: Array
});

/**
*
* Model registration
*
**/
mongoose.model('User', UserSchema);
