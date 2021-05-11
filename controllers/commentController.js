const { body, validationResult } = require('express-validator');
const async = require('async');

const Group = require('../models/group');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');


const like = require('../util/likeFeature').like;

exports.comment_create = [
	body('content', 'Content must not be empty.').trim().isLength({ min: 1 }).escape(),
	function(req, res, next) {
		
		// Extract the validation errors from a request.
        const errors = validationResult(req);
		
		const id = req.params.userId || req.params.groupId;
		const onModel = req.params.userId ? 'User' : 'Group';

		//Select model depending on location of comment
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

		let comment = new comment({
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
            // Data from form is valid. Save comment.
            comment.save(function (err) {
                if (err) { return next(err); }

				//successful - save comment in User/Group comments array
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

				// Successful - return comment
				res.json(comment);
                });
        };
    }
];



exports.edit_comment = function (req, res, next) {
	
	

};

exports.delete_comment = function (req, res, next) {
	
	

};

exports.like_comment = function (req, res, next) {

	like(req, res, next, Comment, req.params.commentId);
};
