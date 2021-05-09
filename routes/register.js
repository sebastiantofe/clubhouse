const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const async = require('async');

/* POST request for register */
router.post("/", (req, res, next) => {

	// encrypt password
	bcrypt.genSalt(10, function (err, salt) {
		if(err) { return next(err)};
		
		bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
			if(err) { return next(err)};
			//Successful, create new user and save it.
			const user = new User({
				username: req.body.username,
				password: hashedPassword,
				fname: req.body.fname,
				lname: req.body.lname,
				email: req.body.email
			}).save((err) => {
				if (err) {
					return next(err);
				}
				res.redirect("/");
			});
		})
	});
});

module.exports = router;