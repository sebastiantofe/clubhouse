const async = require("async");

const Group = require("../models/group");
const User = require("../models/user");
const Post = require("../models/post");

exports.show_feed = function (req, res, next) {
	
	async.parallel(
		{
			friends: function (callback) {
				User.find(
					{
						_id: {
							$in: req.user.friends,
						},
					},
					function (err, friends) {
						if(err) { return next(err)};

						callback(null, friends);
					}
				);
			},
			groups: function(callback) {
				Group.find(
					{
						_id: {
							$in: req.user.groups,
						},
					},
					function (err, groups) {
						if(err) { return next(err)};

						callback(null, groups);
					}
				);
			}
		},
		function (err, results) {
			if(err) { return next(err)};
			
			let postIds = [];
			// Get ids of all friends' posts
			for(let i = 0; i < results.friends.length; i++) {
				if(results.friends[i].posts.length > 0) {
					postIds = [...postIds, ...results.friends[i].posts]
				};
			};

			// Get ids of all posts inside groups of user
			for(let i = 0; i < results.groups.length; i++) {
				if(results.groups[i].posts.length > 0) {
					postIds = [...postIds, ...results.groups[i].posts]
				};
			};

			postIds = [...postIds, ...req.user.posts]

			Post.find(
				{
					_id: {
						$in: postIds,
					}
				}, null, {
						sort: {
							createdAt: -1
						}
					},
				function (err, posts) {
					if(err) { return next(err)};
					
					res.json(posts)
					return;
				}
			);
		}
	);

	// // res.json(req.user);
	// // return;
	// res.send("Feed");

	/* 
	


	async.parallel({
		posts: Post.find({
			'_id': { $in: req.app.locals.currentUser.posts }
		})
	}, function (err, results) {
		if (err) { return next(err)};

		res.render('home', { posts: results.posts })
	}); */
};
