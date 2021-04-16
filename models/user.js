const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
	username: { type: String, required: true, index: true },
	password: { type: String, required: true},
	fname: { type: String, required: true },
	lname: { type: String, required: true },
	email: { type: String, required: true, match: /.+\@..+/},
	picture: { type: String, default: 'default.png'},
	posts: [ { type: Schema.Types.ObjectId, ref: 'Post'} ],
	friends: [ { type: Schema.Types.ObjectId, ref: 'User'} ],
	friendRequests: [ friendRequestSchema ],
	facebookId: String

});

const friendRequestSchema = new Schema({
	sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true},
	sentTo: { type: Schema.Types.ObjectId, ref: 'User', required: true}
});

userSchema
.virtual('fullName')
.get( function() {
	return fname + ' ' + lname
});

//virtual for user's URL
userSchema
.virtual('url')
.get(function() {
	return '/user/' + this._id
});

module.exports = mongoose.model('User', userSchema);