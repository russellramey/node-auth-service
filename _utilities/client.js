/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const parser = require('ua-parser-js');

/**
*
* Parse User Agent
* Take user agent string and returns object with device info like Browser and OS.
*
* @param string: String
* @return Object
*
**/
function parseUserAgent(string) {
	// If no string provided
	if(!string){
		return false;
	}
    // Return object
    return parser(string);
}

/**
*
* Export
*
**/
module.exports = {
    parseUserAgent
};
