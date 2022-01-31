/*jshint esversion: 6*/
/**
*
* Dependencies
*
*/
const crypto = require('crypto');
const fs = require('fs');

/**
*
* Generate Private/Public key pair
*
* Generates keypair to use to sign and verify JWTs
* issued by this service
*
**/
function generateKeyPair() {

    // Generates an object where the keys are stored in properties `privateKey` and `publicKey`
    const keyPair = crypto.generateKeyPairSync('rsa', {
        // bits - standard for RSA keys
        modulusLength: 4096,
        publicKeyEncoding: {
            // type: pkcs1 - Public Key Cryptography Standards 1
            type: 'pkcs1',
            // format: .pem - most common formatting choice
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });

    // Create the public key file, save to root
    fs.writeFileSync(__dirname + '/../rsa_key_pub.pem', keyPair.publicKey);

    // Create the private key file, save to root
    fs.writeFileSync(__dirname + '/../rsa_key_priv.pem', keyPair.privateKey);

}

/**
*
* Run function
*
**/
generateKeyPair();
