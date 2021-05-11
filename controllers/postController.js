const { body, validationResult } = require('express-validator');
const async = require('async');

const Group = require('../models/group');
const User = require('../models/user');
const Post = require('../models/post');
const { compareSync } = require('bcryptjs');

exports.post_create = [
	body('content', 'Content must not be empty.').trim().isLength({ min: 1 }).escape(),
	function(req, res, next) {
		
		// Extract the validation errors from a request.
        const errors = validationResult(req);
		
		const id = req.params.userId || req.params.groupId;
		const onModel = req.params.userId ? 'User' : 'Group';

		//Select model depending on location of post
		const Model = req.params.userId ? User : Group;

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
			author: req.user._id,
			location: id,
			onModel: onModel,
			content: req.body.content
		});
		
		if (!errors.isEmpty()) {

			res.json({
				message: errors.array()
			})
			// res.redirect(req.get('referrer'));
			return;
        }
        else {
            // Data from form is valid. Save post.
            post.save(function (err) {
                if (err) { return next(err); }

				//successful - save post in User/Group posts array
				Model.findByIdAndUpdate(id, {
					$push: { 
						posts: {
							$each:[post._id],
							$position: 0
						}
					}
				}, function (err, doc) {
					if(err) { return next(err)};
				});

/* 				if (onModel==='User') {
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
				}; */

				// Successful - return post
				res.json(post);

                //successful - redirect to referrer page.
				// res.redirect(req.get('referrer'));
                });
        };
    }
];

exports.get_post_detail = function(req, res, next) {
	Post.findById(req.params.postId, function(err, post) {
		if(err) { return next(err)};

		if(post === null) {
            res.json({
                message: 'Post not found'
            });
        } else {
			//Send post 
			res.json(post);
        };
		
	})

};

exports.edit_post = function (req, res, next) {
	
	

};

exports.delete_post = function (req, res, next) {
	
	

};

exports.like_post = function (req, res, next) {

	Post.findById(req.params.postId, function (err, post) {
		if(err) { return next(err)};

		//Check if user has already liked the post or not
		if(!post.likedBy.includes(req.user._id.toString())) {

			//Push current user id in likedBy array
			post.likedBy.push(req.user._id)
			post.save(function (err) {
				if (err) { return next(err)};
				res.json({
					message: "liked"
				});
			});

		} else {

			//Pull current user id from likedBy array
			post.likedBy = post.likedBy.filter(function(value) {
				return value.toString() !== req.user._id.toString();
			});

			post.save(function (err) {
				res.json({
					message: "disliked"
				});
			});
		}
	});
/* 
	Post.findByIdAndUpdate(req.params.postId, {
		$push: { 
			likedBy: req.user._id,
			}	
	}, function (err, doc) {
		if(err) { return next(err)};

		res.json({
			message: "Liked"
		})
	}); */

};