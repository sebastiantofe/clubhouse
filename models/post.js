const mongoose = require('mongoose');
const { Schema } = mongoose;
const { format } = require('date-fns');

const commentSchema= new Schema({
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true},
	content: { type: String, required: true},
	comments: [ commentSchema ],
	likes: { type: Number, min: 0, default: 0 },
	likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	timestamp: { type: Date, default: Date.now }
});

const postSchema= new Schema({
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true},
	content: { type: String, required: true},
	comments: [ commentSchema ],
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

module.exports = mongoose.model('Post', postSchema)