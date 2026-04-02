const express = require('express');

const { signup, login, me } = require('../controllers/auth.controller');

const router = express.Router();

// Signup Route
router.post('/signup', signup);

// Login Route
router.post('/login', login);

// Get Current User (Me)
router.get('/me', me);

module.exports = router;