const mongoose = require('mongoose');
const { Schema } = mongoose;
const { format } = require('date-fns');

const commentSchema= new Schema({
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true},
	content: { type: String, required: true},
	comments: [ { type: Schema.Types.ObjectId, ref: 'Comment'} ],
	likes: { type: Number, min: 0, default: 0 },
	likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);