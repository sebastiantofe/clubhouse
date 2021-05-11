const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

/* POST request for register */
router.post("/register", authController.register);

/* POST request for login */
router.post('/login', authController.login);

module.exports = router;