const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verify2FA,
    resend2FA,
    forgotPassword,
    resetPassword,
    getMe,
    updateDetails,
    updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/resend-2fa', resend2FA);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
