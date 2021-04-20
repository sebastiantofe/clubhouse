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
	likes: { type: Number, min: 0, default: 0 },
	likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	timestamp: { type: Date, default: Date.now},
});

//virtual for post's URL
postSchema
.virtual('formatted_time')
.get(function() {
	return format( new Date(this.timestamp), "dd MMMM yyyy ' at ' HH:mm" )
});

//virtual for post's URL
postSchema
.virtual('url')
.get(function() {
	return '/posts/' + this._id
});

postSchema.plugin(require('mongoose-autopopulate'));




module.exports = mongoose.model('Post', postSchema)