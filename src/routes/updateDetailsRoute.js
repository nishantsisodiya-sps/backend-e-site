const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const update = require('../controller/updateDetails')


router.put('/user/:userId', auth.checkLoggedIn, update.updateProfile)


router.put('/seller/:sellerId', auth.checkLoggedIn, update.updateProfile)


router.put('/changePassword/:userId?/:sellerId?', update.changePassword);


// POST route to send password reset email
router.post('/reset-password/email', update.sendPasswordResetEmail);

// POST route to reset password
router.post('/reset-password', update.resetPassword);


module.exports = router;