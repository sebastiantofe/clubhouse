const { body, validationResult } = require('express-validator');
const async = require('async');

const Group = require('../models/group');
const User = require('../models/user');
const Post = require('../models/post');

exports.post_create = [
	body('content', 'Content must not be empty.').trim().isLength({ min: 1 }).escape(),
	function(req, res, next) {
		
		// Extract the validation errors from a request.
        const errors = validationResult(req);
		
		const id = req.params.userId || req.params.groupId;
		const onModel = req.params.userId ? 'User' : 'Group';
		/* 
		let test = {
			id: id,
			model: onModel,
			url: req.originalUrl,
			referrer: req.get('referrer'),
			errors: errors.array()
		};
		console.log(test); */

		let post = new Post({
			author: req.app.locals.currentUser._id,
			location: id,
			onModel: onModel,
			content: req.body.content
		});
		
		if (!errors.isEmpty()) {

			res.redirect(req.get('referrer'));
			return;
        }
        else {
            // Data from form is valid. Save post.
            post.save(function (err) {
                if (err) { return next(err); }

				//successful - save post in User/Group posts array
				if (onModel==='User') {
					User.findById(id, function (err, user) {
						if(err) { return next(err)};
					
						user.posts.unshift(post._id);

						user.save(function (err) {
							if(err) { return next(err)};
						});
					});
				} else {

					Post.findById(id, function (err, group) {

						group.posts.unshift(post._id);

						post.save(function (err) {
							if(err) { return next(err)};
						});
					});
				};
                //successful - redirect to referrer page.
				res.redirect(req.get('referrer'));
                });
        };
    }
];

exports.get_post_detail = function(req, res, next) {

};