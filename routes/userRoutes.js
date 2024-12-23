const router = require('express').Router()

const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/userModels');
const userControllers = require('../controllers/userControllers');
// Make a create user API
router.post('/create', userControllers.createUser);

// Login user API
router.post('/login', userControllers.loginUser)



module.exports = router;

