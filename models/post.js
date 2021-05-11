const mongoose = require('mongoose');
const { Schema } = mongoose;
const { format } = require('date-fns');
const Comment = require('./comment');

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




module.exports = mongoose.model('Post', postSchema)