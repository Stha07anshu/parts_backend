const router = require('express').Router()

const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/userModels');
const userControllers = require('../controllers/userControllers');
const { authGuard } = require('../middleware/authGuard');
// Make a create user API
router.post('/create', userControllers.createUser);

// Login user API
router.post('/login', userControllers.loginUser)

// Update user details (either by old password or OTP)
router.post('/update/:id', authGuard, userControllers.updateUser);

// Request OTP for updating user details
router.post('/request-otp', userControllers.requestOtp);



module.exports = router;

