const mongoose = require('mongoose');
const { Schema } = mongoose;
const { format } = require('date-fns');
const Comment = require('./comment');
const User = require('./user');
const Group = require('./group');

const postSchema= new Schema({
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true, autopopulate: true},
	location: {
		type: Schema.Types.ObjectId,
		required: true,
		// Instead of a hardcoded model name in `ref`, `refPath` means Mongoose
    	// will look at the `onModel` property to find the right model.
   		refPath: 'onModel'
	},
	onModel: {
		type: String,
		required: true,
		enum: ['User', 'Group']
	  },
	content: { type: String, required: true},
	comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', autopopulate: true }],
	likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true,
	toJSON: { virtuals: true } 
	}
);

//virtual for post's formatted time
postSchema
.virtual('created_formatted')
.get(function() {
	return format( new Date(this.createdAt), "dd MMMM yyyy ' at ' HH:mm" )
});

postSchema
.virtual('updated_formatted')
.get(function() {
	return format( new Date(this.updatedAt), "dd MMMM yyyy ' at ' HH:mm" )
});

//virtual for post's URL
postSchema
.virtual('url')
.get(function() {
	return '/posts/' + this._id
});

//virtual for number of likes
postSchema
.virtual('likes')
.get(function() {
	return this.likedBy.length
});

postSchema.plugin(require('mongoose-autopopulate'));

postSchema.pre('remove', function(next) {

	function removePostId(Model, id) {


		//Remove post id from User/Group posts array
		Model.findByIdAndUpdate(id, {
			$pull: {
				posts: this._id
			}
		}, function(err) {
			if(err) { return next(err)};
		});

	}

	const Model = this.onModel === 'User' ? User : Group;
	
	removePostId(Model, this.location)
		
	if(!this.comments.length > 0) {
		return next();
	} else {
		
		for(let i = 0; i < this.comments.length; i++) {
			
			Comment.findById(this.comments[i], function(err, comment) {
				if(err) { return next(err)};
				
				comment.remove();
			});
		};
		return next();
	};
});





module.exports = mongoose.model('Post', postSchema);