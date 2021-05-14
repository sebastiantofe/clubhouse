const { body, validationResult } = require('express-validator');

const Post = require('../models/post');
const Comment = require('../models/comment');
const Group = require('../models/group');

const like = require('../util/likeFeature').like;

exports.comment_create = [
	body('content', 'Content must not be empty.').trim().isLength({ min: 1 }).escape(),
	function(req, res, next) {
		// Extract the validation errors from a request.
        const errors = validationResult(req);
		

		const id = req.params.commentId || req.params.postId;
		const onModel = req.params.commentId ? 'Comment' : 'Post';

		//Select model depending on location of comment
		const Model = req.params.commentId ? Comment : Post;

		//Check if post is in group or user profile
		const postLocation = req.params.userId ? 'User' : 'Group';

		let comment = new Comment({
			author: req.user._id,
			post: req.params.postId,
			location: id,
			onModel: onModel,
			content: req.body.content
		});
		
		if (!errors.isEmpty()) {
			res.json({
				error: errors.array()
			})
        } else {

			let same_profile = false;
			let friends = false;
			let groupMember = false;
			if(postLocation==='User') {
				
				// Check if the post is in current user profile
				same_profile = req.user.id === req.params.userId

				// Check if the post is in a current user friend's profile
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
				});
			};

			const authorized = same_profile || friends || groupMember;
			if(authorized) { 

				// User is authorized. Save comment.
				comment.save(function (err) {
					if (err) { return next(err)};
					
					//successful - save comment in Post/Comment comments array
					Model.findByIdAndUpdate(id, {
					$push: { 
						comments: comment._id
					}
				}, function (err, doc) {
					if(err) { return next(err)};
				});
				
				// Successful - return comment
				res.json(comment);
			});
			
			
		} else {
			res.json({
					message: 'Unauthorized. You can\'t create this comment'
				});
				return;
			}

        };
    }
];



exports.edit_comment = function (req, res, next) {
	
	

};

exports.delete_comment = function (req, res, next) {
	
	function deleteComment(Model, id) {


		//Remove comment id from post/comment comments array
		Model.findByIdAndUpdate(id, {
			$pull: {
				comments: req.params.commentId
			}
		}, function(err) {
			if(err) { return next(err)};
			
			// Delete comment
			Comment.findById(req.params.commentId, function(err, comment) {
				if(err) { return next(err)};
				comment.remove();
				res.json({ 
					message: 'Comment deleted'
				});
				return
			})
	
		});

	}

	Comment.findById(req.params.commentId, function(err, comment) {
		
		if (err) { return next(err)};

			if(comment===null) {
				res.json({
					message: 'Comment not found'
				})
				return;
			};

		let authorized = false

		const author = req.user.id === comment.author.id
		let owner = false;
		
		const Model = comment.onModel === 'Comment' ? Comment : Post;

		Post.findById(comment.post, function(err, post) {
			if (err) { return next(err)};

			if(post===null) {
				res.json({
					message: 'Post not found'
				})
			};
			
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
					owner = req.user.id === group.owner.toString();

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
				deleteComment(Model, comment.location);
				return;
			} else {
				res.json({
					message: 'Unauthorized. You can\'t delete this comment'
				})
			}



		});
	
	});
	
	

};

exports.like_comment = function (req, res, next) {
	
	like(req, res, next, Comment, req.params.commentId);
	
};
