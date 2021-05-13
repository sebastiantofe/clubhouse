const { body, validationResult } = require('express-validator');
const async = require('async');

const Group = require('../models/group');
const User = require('../models/user');
const Post = require('../models/post');
const { compareSync } = require('bcryptjs');

const like = require('../util/likeFeature').like;

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
			let same_profile = false;
			let friends = false;
			let groupMember = false;
			if(post.onModel==='User') {
				// Check if user is creating a post in its own profile
				same_profile = req.user.id === req.params.userId
				//Check if user is creating a post in a friend's profile
				friends = req.user.friends.includes(req.params.userId)
			} else {
				Group.findById(req.params.groupId, function(err, group) {
					if(err) { return next(err)};
					if(group===null) {
						res.json({
							message: 'Group not found'
						})
						return
					}

					groupMember = group.members.includes(req.user.id);
				})
			};

			const authorized = same_profile || friends || groupMember;
			if(authorized) { 

				// User is authorized. Save post.
				post.save(function (err) {
					if (err) { return next(err)};
	
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
	
					// Successful - return post
					res.json(post);

				});
				return;
			} else {
				res.json({
					message: 'Unauthorized. You can\'t create this post'
				});
				return;
			}
			
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
	
	function deletePost(Model, id) {


		//Remove post id from User/Group posts array
		Model.findByIdAndUpdate(id, {
			$pull: {
				posts: req.params.postId
			}
		}, function(err, doc) {
			if(err) { return next(err)};

			// Delete post
			Post.findById(req.params.postId, function(err, post) {
				if(err) { return next(err)};
				res.json({ 
					message: 'Post deleted'
				})
				post.remove();
			});
	
		});

	}

	Post.findById(req.params.postId, function(err, post) {
		
		if (err) { return next(err)};

			if(post===null) {
				res.json({
					message: 'Post not found'
				})
				return;
			};

		let authorized = false
		const author = req.user.id === post.author.id
		let owner = false;
		
		const Model = post.onModel === 'User' ? User : Group;

		if(post.onModel==='User'){
			
			// Check if the post is written in current user profile
			owner = req.user.id === post.location.toString();

			authorized = owner || author;


		} else {

			let role;

			Group.findById(req.params.groupId, function(err, group) {
				
				if (err) { return next(err)};

				if(group===null) {
					res.json({
						message: 'Group not found'
					})
				};

				// Check if current user is owner of group
				owner = req.user.id === group.owner.toString()

				for(let i = 0; i < group.roles.length; i++) {
					if(group.roles[i].users.includes(req.user.id)) {
						
						role = group.roles[i];
						break;
					}
				};

				role = role.actions.includes('delete_comment');

				authorized = author || owner || role

			});	
		};

		if(authorized) {
			deletePost(Model, post.location);	
			return	
		} else {
			res.json({
				message: 'Unauthorized. You can\'t delete this post'
			})
			return
		}
	
	});
	
	

};

exports.like_post = function (req, res, next) {
	
	like(req, res, next, Post, req.params.postId);
};