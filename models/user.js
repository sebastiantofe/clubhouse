const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const friendRequestSchema = new Schema({
	from: { type: Schema.Types.ObjectId, ref: 'User', required: true},
	to: { type: Schema.Types.ObjectId, ref: 'User', required: true}
});

const userSchema = new Schema({
	username: { type: String, required: true, unique: true},
	password: { type: String, required: true,  select: false },
	fname: { type: String, required: true },
	lname: { type: String, required: true },
	email: { type: String, required: true, unique: true, match: /.+\@..+/},
	picture: { type: String, default: 'default.png'},
	posts: [ { type: Schema.Types.ObjectId, ref: 'Post'} ],
	friends: [ { type: Schema.Types.ObjectId, ref: 'User'} ],
	friendRequests: [ friendRequestSchema ],
	groups: [ { type: Schema.Types.ObjectId, ref: 'Group'}],
	facebookId: String
}, { timestamps: true,
	toJSON: { virtuals: true } 
	}
);

userSchema
.virtual('fullName')
.get( function() {
	return this.fname + ' ' + this.lname
});

//virtual for user's URL
userSchema
.virtual('url')
.get(function() {
	return '/' + this._id
});

userSchema.methods.comparePassword = function (pass, cb) {
    bcrypt.compare(pass, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema);