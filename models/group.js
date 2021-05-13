const mongoose = require('mongoose');

const { Schema } = mongoose;

const ACTIONS = {
	delete_comment: "delete_comment",
	expel_user: "expel_user",
	ban_user: "ban_user",
	edit_group: "edit_group",
};

const roleSchema= new Schema({
	name: { type: String, required: true},
	users: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
	actions: [ { type: String, required:true} ]
});



const groupSchema = new Schema({
	name: { type: String, required: true, index: true },
	password: { type: String, select: false },
	private: { type: Boolean, required: true },
	picture: String,
	owner: { type: Schema.Types.ObjectId, ref: 'User', required: true},
	description: String,
	members: [ { type: Schema.Types.ObjectId, ref: 'User', required: true} ],
	banned: [ { type: Schema.Types.ObjectId, ref: 'User'} ],
	posts: [ { type: Schema.Types.ObjectId, ref: 'Post'}],
	roles: [{ type: roleSchema, default: [] }],
}, { timestamps: true,
	toJSON: { virtuals: true } 
	}
);

//virtual for group's URL
groupSchema
.virtual('url')
.get(function() {
	return '/posts/' + this._id
});


module.exports = mongoose.model('Group', groupSchema);