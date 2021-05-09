const mongoose = require('mongoose');

const { Schema } = mongoose;


const roleSchema= new Schema({
	name: { type: String, required: true},
	users: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
});

const groupSchema = new Schema({
	name: { type: String, required: true, index: true },
	password: String,
	private: Boolean,
	picture: String,
	owner: { type: String, required: true},
	description: String,
	likes: { type: Number, min: 0, default: 0 },
	members: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
	posts: [ { type: Schema.Types.ObjectId, ref: 'Post'}],
	roles: [{ type: roleSchema, default: [] }],
	createdOn: { type: Date, default: Date.now },
});

//virtual for group's URL
groupSchema
.virtual('url')
.get(function() {
	return '/posts/' + this._id
});

module.exports = mongoose.model('Group', groupSchema);