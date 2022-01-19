/**
*
* Dependencies
*
**/
const router = require('express').Router();

/**
*
* Routes
*
**/
// Wildcard, match anything
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
