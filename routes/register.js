const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const async = require('async');

/* POST request for register */
router.post("/", (req, res, next) => {

	// encrypt password
	bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
		if(err) { return next(err)};
		//Successful, create new user and save it.
		const user = new User({
			username: req.body.username,
			password: hashedPassword,
		}).save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect("/");
		});
	})
});

module.exports = router;