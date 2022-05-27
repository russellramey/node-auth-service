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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [ true, '[user_id] is required for Token']
    },
    name: {
        type: String,
        default: null,
        required: [ true, '[name] is required for Token']
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
    refresh_token: String,
    refresh_id: String
});

/**
*
* Serialization settings
*
**/
TokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.refresh_token;
    }
});

/**
*
* Register model
*
**/
mongoose.model('Token', TokenSchema);
