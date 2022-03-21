/*jshint esversion: 6*/
/**
 *
 * Dependencies
 *
 **/
const router = require('express').Router();
const users = require('../_models/UserController');
const tokens = require('../_models/TokenController');
const hash = require('../_utilities/hash');
const jwt = require('../_utilities/jwt');

/**
 *
 * Create new user
 * Add user to database
 * @param req: Request object
 * @param res: Response object
 * @return res: Response object
 *
 **/
const createUser = (req, res) => {
    // Create new user object
    const newUser = users.newUser(req.body);

    // Save user object
    newUser.save()
        .then((user) => {
            // Return success with user
            return res.json({ success: true, user: user });
        })
        .catch((err) => {
            // Return error
            return res.status(400).json({ success: false, error: err.message });
        });
};

/**
 *
 * Authenticate user
 * Issue new access token (jwt) via Email/Password
 * @param req.email: String
 * @param req.password: String
 * @return auth: Object
 *
 **/
const authenticateUser = (req, res) => {
    // Find single user by email
    users.getUsers({ email: req.body.email }, [], true)
        .then( user => {
            // If no user is found, or no password in request
            if(!user || !req.body.password || user.provider.name !== 'local') {
                return res.status(401).json({ success: false, msg: "Invalid credentials" });
            }

            // Check req.password hash matches found user passowrd hash
            const isValidPass = hash.compareHashString(req.body.password, user.password, user.salt);

            // If password is valid
            if (isValidPass) {

                // Create new token object
                const userToken = tokens.newToken(user, req.headers['user-agent']);

                // Save userToken object
                userToken.save()
                    .then((token) => {
                        // Create new JWT from token model
                        const jwtObject = jwt.generateJWT(token);

                        // If JWT was created successfully
                        if (!jwtObject.token) {
                            // Return error
                            return res.status(400).json({ success: false, error: 'JWT failed to generate.' });
                        }

                        // Set refresh token cookie
                        res.cookie('testcookie', token.refresh_token, {
                            httpOnly: true,
                            sameSite: 'none',
                            secure: false
                        });

                        // Return success with token
                        return res.status(200).json({ success: true, auth: jwtObject });
                    })
                    .catch((token_error) => {
                        // Return error
                        return res.status(400).json({ success: false, error: token_error.message });
                    });

            } else {
                // Return error
                return res.status(401).json({ success: false, error: "Invalid credentials" });
            }

        })
        .catch( user_error => {
            // Return error
            return res.status(400).json({ success: false, error: user_error.message });
        });
};

/**
 *
 * Local Auth
 * Method: POST
 * URI: /auth/local
 * @return res: Object
 *
 **/
router.post('/local', function(req, res) {
    // If request inclues newUser parameter
    if(req.body.newUser === true){
        // Create new user
        return createUser(req, res);
    }
    // Authenticate existing user
    return authenticateUser(req, res);
});

/**
 *
 * Export
 *
 **/
module.exports = router;
