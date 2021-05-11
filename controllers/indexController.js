const async = require('async');

const Group = require('../models/group');
const User = require('../models/user');
const Post = require('../models/post');

exports.show_feed_get = function(req, res, next) {

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