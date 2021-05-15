const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const passport = require("passport");
require('../util/passport');

exports.register = (req, res, next) => {

	// encrypt password
	bcrypt.genSalt(10, function (err, salt) {
		if(err) { return next(err)};
		
		bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
			if(err) {return next(err)};
			//Successful, create new user and save it.
			const user = new User({
				username: req.body.username,
				password: hashedPassword,
				fname: req.body.fname,
				lname: req.body.lname,
				email: req.body.email
			});
			user.save((err) => {
				if (err) {
				email = err.keyPattern?.email
				username = err.keyPattern?.username
				if(email) {
					res.json({
						message: 'Email already in use'
					})
					return;
				} else if(username) {
					res.json({
						message: 'Username already in use'
					});
					return;
				} else {
					return next(err);
				}
			}
			res.json({message: 'User registered successfully'});
		});
		})
	});
};

exports.login = function (req, res, next) {
	passport.authenticate("local", { session: false }, (err, user, info) => {
		if (err || !user) {
			return res.status(400).json({
				message: "Something is not right",
				user: user,
			});
		};

		req.login(user, { session: false }, (err) => {
			if (err) {
				res.status(401).json({ message: "Auth Failed" })
			}
			// generate a signed son web token with the contents of user object and return it in the response
			let opts = {
				expiresIn: 60 * 60 * 48 // 48 hours
			}
			const token = jwt.sign( { id: user._id }, process.env.JWT_SECRET, opts);

			return res.status(200).json({ user: user._id, token });
		});
		
		
	})(req, res);
};
