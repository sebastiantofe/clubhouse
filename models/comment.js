const mongoose = require('mongoose');
const { Schema } = mongoose;
const { format } = require('date-fns');

const commentSchema= new Schema({
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true,  autopopulate: true },
	content: { type: String, required: true},
	comments: [ { type: Schema.Types.ObjectId, ref: 'Comment',  autopopulate: true } ],
	likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true});


commentSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Comment', commentSchema);