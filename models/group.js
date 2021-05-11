const mongoose = require('mongoose');

const { Schema } = mongoose;


const roleSchema= new Schema({
	name: { type: String, required: true},
	users: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
});



const groupSchema = new Schema({
	name: { type: String, required: true, index: true },
	password: { type: String, select: false },
	private: { type: Boolean, required: true },
	picture: String,
	owner: { type: String, required: true},
	description: String,
	members: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
	posts: [ { type: Schema.Types.ObjectId, ref: 'Post'}],
	roles: [{ type: roleSchema, default: [] }],
}, { timestamps: true});

//virtual for group's URL
groupSchema
.virtual('url')
.get(function() {
	return '/posts/' + this._id
});

module.exports = mongoose.model('Group', groupSchema);