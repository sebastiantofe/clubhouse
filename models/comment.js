const mongoose = require('mongoose');
const { Schema } = mongoose;
const { format } = require('date-fns');

const commentSchema= new Schema({
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true,  autopopulate: true },
	post: { type: Schema.Types.ObjectId, ref: 'Post', required: true},
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
		enum: ['Comment', 'Post']
	  },
	content: { type: String, required: true},
	comments: [ { type: Schema.Types.ObjectId, ref: 'Comment',  autopopulate: true } ],
	likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true,
	toJSON: { virtuals: true } 
	}
);

commentSchema.plugin(require('mongoose-autopopulate'));


//virtual for number of likes
commentSchema
.virtual('likes')
.get(function() {
	return this.likedBy.length
});


commentSchema.pre('remove', function(next) {
	
	if(!this.comments.length > 0) {
		return next();
	} else {

		for(let i = 0; i < this.comments.length; i++) {
			
			Comment.findById(this.comments[i], async function(err, comment) {
				if(err) { return next(err)};
				
				comment.remove();
			});
		};
		return next();
	};
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = mongoose.model('Comment', commentSchema);