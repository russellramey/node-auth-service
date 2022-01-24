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
const TokenSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: [ true, 'user_id is required for Token']
    },
    name: {
        type: String,
        default: 'User Access Token'
    },
    revoked: {
        type: Boolean,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    expires_at: {
        type: Date
    },
    client: Object,
    hash: String,
});

/**
*
* Register model
*
**/
mongoose.model('Token', TokenSchema);
