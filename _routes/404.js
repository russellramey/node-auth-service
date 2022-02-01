/*jshint esversion: 6*/
/**
*
* Dependencies
*
**/
const router = require('express').Router();

/**
 *
 * Wildcard
 * Match anything if route doesnt exist
 * Method: GET, POST, PUT/PATCH, DELETE
 * URI: /*
 * @param null
 * @return error: Object
 *
 **/
router.all('*', function(req, res){
  res.status(404).json({
        "error": true,
        "message": "Endpoint not currently available or unknown.",
        "status" : 404
    });
});

/**
*
* Export
*
**/
module.exports = router;
