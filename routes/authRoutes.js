const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/authController');
const router = express.Router();

router.post('/send-otp', sendOtp); // Step 1: Send OTP
router.post('/verify-otp', verifyOtp);

module.exports = router;
