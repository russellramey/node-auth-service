/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const crypto = require('crypto');

/**
*
* Hash String
* Takes a plain text string, salts it, and creates sha512 hash.
*
* @param string: String
* @param salt: String
*
**/
function hashString(string, salt) {
	// If no salt provided
	if(!salt){
        // Generate new random string
		salt = crypto.randomBytes(32).toString('hex');
	}

    // Hash plain text string with random salt
    // crypto.pbkdf2Sync considers the 'string' paramter as 'password' for debugging
    let hash = crypto.pbkdf2Sync(string, salt, 10000, 64, 'sha512').toString('hex');

    // Return object
    return {
      salt: salt,
      hash: hash
    };
}

/**
*
* Compare Hash String
* Validate/verify plain text is same as supplied hash.
*
* @param string: String
* @param hash: String
* @param salt: String
*
**/
function compareHashString(string, hash, salt) {
	// Create new hash
    let hashObj = hashString(string, salt);

    // Return boolean
    return hash === hashObj.hash;
}

/**
*
* Export
*
**/
module.exports = {
    hashString,
    compareHashString
};
