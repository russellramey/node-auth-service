/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
require('dotenv').config();

/**
*
* Create cookie
* Create a cookie object based on supplied arguments.
*
* @param string: String
* @return Object
*
**/
const generateCookie = async (args) => {
	// If no args provided
	if(!args) return false;
    // Create cookie object
    const cookie = {
        name: (args.name ? args.name : process.env.REFRESH_COOKIE_NAME), 
        value: args.value,
        options: {
            httpOnly: true,
            sameSite: 'none',
            secure: false
        }
    }
    // Return cookie
    return cookie;
}

/**
*
* Export
*
**/
module.exports = {
    generateCookie
};
