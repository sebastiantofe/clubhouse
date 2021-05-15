
const User = require('../models/user');
const mongoose = require('mongoose');
const async = require('async');
exports.is_friend_or_same = function(req, res, next) {
	
	// Check if current user is asking for its own friends list
	const same = req.user.id === req.params.userId;

	// Check if current user asking for a friend's friends list
	const friends = req.user.friends.includes(req.params.userId)

	if(same || friends) {
		next();
	} else {
		res.json({
			message: "Unauthorized. You can't see this user's friends list"
		});
	}
};

exports.is_not_same_or_friend = function (req, res, next) {

	// Check if current user is in its profile
	const same = req.user.id === req.params.userId;

	// Check if current user is already friend of profile user
	const friends = req.user.friends.includes(req.params.userId);

	if (friends) {
		res.json({
			message: "You are already friend of this person",
		});
		return;
	} else if (same) {
		res.json({
			message: "You can't send a friend request to yourself",
		});
		return;

	} else {
		next();
		return
	} 
};

exports.request_exists = function (req, res, next) {
	console.log('Add friend');
	if (req.user.friendRequests.length > 0) {
		for (let i = 0; i < req.user.friendRequests.length; i++) {
			const sentRequest =
			req.user.friendRequests[i].from.toString() === req.user.id &&
			req.user.friendRequests[i].to.toString() === req.params.userId;
			const receivedRequest =
				req.user.friendRequests[i].from.toString() === req.params.userId &&
				req.user.friendRequests[i].to.toString() === req.user.id;

				if (sentRequest) {
				res.json({
					message: "You already sent a friend request to this user"
				});
				return;
			} else if (receivedRequest) {
				res.json({
					message: "You already received a friend request from this user"
				});
				return;
			};
		}
	} else {
		next();
	}
};

exports.request_missing = function (req, res, next) {

	if (req.user.friendRequests.length > 0) {

		for (let i = 0; i < req.user.friendRequests.length; i++) {

			const receivedRequest =
				req.user.friendRequests[i].from.toString() === req.params.userId &&
				req.user.friendRequests[i].to.toString() === req.user.id;
			
			if (receivedRequest) {
				next();
				return;
			} else {
				res.json({
					message: "You have not received a friend request from this user"
				});
				return;
			}
		}
	} else {
		res.json({
			message: "You don't have friend requests"
		});
		return;
	}
};
exports.show_friends = function(req, res, next) {
	
	User.findById(req.params.userId, function(err, user) {

		if(err) { return next(err)};
		if(user===null) {
			res.json({
				message: 'User not found'
			});
			return;
		};

		res.json({
			friends: user.friends
		});
	});
};

exports.add_friend = function(req, res, next) {

	const friendRequest = {
		from: req.user._id,
		to: req.params.userId
	};
	const userId = mongoose.Types.ObjectId(req.params.userId);
	const ids = [req.user._id, userId]

	User.updateMany({
		_id: { 
			$in: ids
		}
	}, {
		$push: { 
			friendRequests: friendRequest
		}
	}, function (err) { 
		if(err) { return next(err)};
		
		res.json({
			message: "Friend request sent"
		});
		return;
	});
	
};
exports.handle_friend_request = function(req, res, next) {
	// Check if action was sent
	const action = req.body.action
	const userId = mongoose.Types.ObjectId(req.params.userId);
	const ids = [req.user._id, userId];
	
	const friendRequest = {
		from: userId,
		to: req.user._id
	};

	if(!action) {
		res.json({
			message: "Send action"
		});
		return;

	 // Logic for accepting a friend request
	} else if (action ==="confirm") {

		async.parallel(
			[
				function(callback) {

					//Add user id to current user's friends array
					req.user.friends.push(userId);
					req.user.save(function(err) {
						if(err) { return next(err)};
						callback(null);
					});
				},
				function(callback) {
					
					//Add current user id to the other user's friends array
					User.findByIdAndUpdate(userId, {
						$push: { 
							friends: req.user._id
						}
					}, function (err) {
						if(err) { return next(err)};
						callback(null);
					});

				}
			], function (err) {
				if(err) { return next(err)};
				
				User.updateMany({
					_id: { 
						$in: ids
					}
				}, {
					$pull: { 
						friendRequests: friendRequest
					}
				}, function (err) { 
					if(err) { return next(err)};
					res.json({
						message: "Added friend"
					});
					return;
				});

			}
			);
		
	 // Logic for rejecting friend request
	} else if (action ==="reject") {

		User.updateMany({
			_id: { 
				$in: ids
			}
		}, {
			$pull: { 
				friendRequests: friendRequest
			}
		}, function (err) { 
			if(err) { return next(err)};
			res.json({
				message: "You rejected this friend request"
			});
			return;
		});

	} else {
		res.json({
			message: "Invalid action"
		});
		return;
	}
};

exports.is_not_same_and_is_friend = function (req, res, next) {

	// Check if current user is in its profile
	const same = req.user.id === req.params.userId;

	// Check if current user is already friend of profile user
	const friends = req.user.friends.includes(req.params.userId);

	if (same) {
		res.json({
			message: "You can not do this action",
		});
		return;

	} else if (!friends) {
		res.json({
			message: "You are not friend of this person",
		});
		return;
	} else {
		next();
		return
	} 
};

exports.delete_friend = function(req, res, next) {

	const userId = mongoose.Types.ObjectId(req.params.userId);
	const ids = [req.user._id, userId];
	
	// Remove user ids from both user's friends list
	User.updateMany({
		_id: { 
			$in: ids
		}
	}, {
		$pull: { 
			friends: {
				$in: ids
			}
		}
	}, function (err) { 
		if(err) { return next(err)};
		res.json({
			message: "You removed this friend from your friends list"
		});
		return;
	});
};