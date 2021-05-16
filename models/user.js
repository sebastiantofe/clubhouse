const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;
const Post = require('./post');
const Group = require('./group');
const Comment = require('./comment')
const async = require("async");
const friendRequestSchema = new Schema({
	from: { type: Schema.Types.ObjectId, ref: 'User', required: true},
	to: { type: Schema.Types.ObjectId, ref: 'User', required: true}
});

const userSchema = new Schema({
	username: { type: String, required: true, unique: true},
	password: { type: String, required: true,  select: false },
	fname: { type: String, required: true },
	lname: { type: String, required: true },
	email: { type: String, required: true, unique: true, match: /.+\@..+/},
	picture: { type: String, default: 'default.png'},
	posts: [ { type: Schema.Types.ObjectId, ref: 'Post'} ],
	friends: [ { type: Schema.Types.ObjectId, ref: 'User'} ],
	friendRequests: [ friendRequestSchema ],
	groups: [ { type: Schema.Types.ObjectId, ref: 'Group'}],
	facebookId: String
}, { timestamps: true,
	toJSON: { virtuals: true } 
	}
);

userSchema
.virtual('fullName')
.get( function() {
	return this.fname + ' ' + this.lname
});

//virtual for user's URL
userSchema
.virtual('url')
.get(function() {
	return '/' + this._id
});

userSchema.methods.comparePassword = function (pass, cb) {
    bcrypt.compare(pass, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

userSchema.pre('remove', async function(next) {
	// --author post or --comment, --location post, --friends, --friendRequests, remove from groups
	let currentUser = this;
	
	async.series({
		posts: function(callback) {

			for(let i = 0; i < currentUser.posts.length; i++) {
				Post.findById(currentUser.posts[i], function(err, post) {
					if(err) { return next(err)};
					if (post !==null) {
						post.remove(); 
					}
				});
			}
		
			Post.find({
				author: currentUser._id
			}, function(err, posts) {
				if(err) { return next(err)};

				for(let i= 0; i < posts.length; i++) {
					if(err) { return next(err)};

					posts[i].remove();
				}
				
				callback(null)
			});
			
		},

		// Remove from friends and friend requests
		removeFromFriends: function(callback) {
			let sentIds = [];
			let receivedIds = [];

			for(let i = 0; i < currentUser.friendRequests.length; i++) {
				const sameTo = currentUser.friendRequests[i].to.toString() === currentUser.id;
				if(!sameTo) {

					sentIds.push(currentUser.friendRequests[i].to);
				} else {					
					receivedIds.push(currentUser.friendRequests[i].from);
				};

			};

			async.series([
				function(cb) {
					// Remove current user id from other users' friends array
					User.updateMany({
						_id: { 
							$in: currentUser.friends
						}
					}, {
						$pull: {
							friends: currentUser._id,
						}
					}, function (err) { 
						if(err) { 
							return next(err)
						};
							cb(null)
					});

				}, function(cb) {

					// Remove friend requests sent by current user
					User.updateMany({
						_id: { 
							$in: sentIds
						}
					}, {
						$pull: {
							friendRequests: { 
								from: currentUser._id,
							}
						}
					}, function (err) { 
						if(err) { 
							return next(err)
						};
							cb(null)
					});

					
				}, function(cb) {
					// Remove friend requests sent to current user
					User.updateMany({
						_id: { 
							$in: receivedIds
						}
					}, {
						$pull: {
							friendRequests: { 
								to: currentUser._id,
							}
						}
					}, function (err) { 
						if(err) { 
							return next(err)
						};
							cb(null)
					});
				}

			], function (err) {
				if(err) { return next(err)};
				callback(null)
			})

		},

		comments: function(callback) {
			function deleteComment(Model, id, comment) {

				//Remove comment id from post/comment comments array
				Model.findByIdAndUpdate(id, {
					$pull: {
						comments: comment._id
					}
				}, function(err) {
					if(err) { return next(err)};
					
					// Delete comment
					comment.remove();
			
				});
		
			}
			 // Find comments where the author === current user
			Comment.find({
				author: currentUser._id
			}, function(err, comments) {
				if(err) { return next(err)};
				for(let i = 0; i < comments.length; i++) {

					const Model = comments[i].onModel === 'Comment' ? Comment : Post;
					deleteComment(Model, comments[i].location,comments[i])
				};
				callback(null);
			})
		}, 

		//Remove current user from groups
		groups: function(callback) {
			Group.updateMany({
				_id: { 
					$in: currentUser.groups
				}
			}, {
				$pull: {
					members: currentUser._id,
					roles: {
						users : currentUser._id
					}
				}
			}, function (err) {
				if(err) { 
					return next(err)
				};
				// Find groups that currentUser owns and delete them
				Group.find({
					owner: currentUser._id
				}, function(err, groups) {
					if(err) { return next(err)};

					for(let i = 0; i < groups.length; i++) {
						group[i].remove();
					};
					
					callback(null)
				});
			});
		}

	}, function(err) {
		if(err) { return next(err)};
		return;
	});
	
});

User = mongoose.model('User', userSchema);
module.exports = User;