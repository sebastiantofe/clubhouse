
module.exports.like = function(req, res, next, Model, id) {
	Model.findById(id, function (err, doc) {
		if(err) { return next(err)};

		//Check if user has already liked the post/comment or not
		if(!doc.likedBy.includes(req.user._id.toString())) {

			//Push current user id in likedBy array
			doc.likedBy.push(req.user._id)
			doc.save(function (err) {
				if (err) { return next(err)};
				res.json({
					message: "liked"
				});
			});

		} else {

			//Pull current user id from likedBy array
			doc.likedBy = doc.likedBy.filter(function(value) {
				return value.toString() !== req.user._id.toString();
			});

			doc.save(function (err) {
				res.json({
					message: "disliked"
				});
			});
		}
	});
}