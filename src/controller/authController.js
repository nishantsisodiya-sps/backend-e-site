const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

//<<<<<<<======================  HANDLE USER LOGIN API ================>>>>>>>>


exports.login = function (req, res) {
    // Check if there are any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    // Find the user with the given email
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the given password matches the stored password
        bcrypt.compare(req.body.password, user.password, function (err, result) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            if (!result) {
                return res.status(401).json({ message: 'Incorrect password' });
            }

            // If the password is correct, generate a token and send it to the client
            const token = user.generateAuthToken(); // call the generateAuthToken method on the user instance
            res.json({ token: token , message: "Logged in successfully", success: true,});
        });
    });
};


//<<<<<<<====================== HANDLE USER REGISTRATION API ================>>>>>>>>


exports.register = function (req, res) {
    // Check if there are any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    // Create a new user instance
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    // Save the user to MongoDB
    user.save(function (err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
         });
    }
