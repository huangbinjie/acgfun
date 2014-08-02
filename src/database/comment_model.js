'use strict';

var mongoose = require('mongoose'),
	autoinc  = require('mongoose-id-autoinc'),
	Schema	 = mongoose.Schema;


var commentModel = function(){
	var postSchema = new Schema({
		user_id		: {type:Number,ref:'User'},//用户ID
		post_id		: {type:Number,ref:'Post'},//文章ID
		content		: {type:String,,required:true},//评论内容
		parent_id	: Number,
		createDate	: Date,
		modifyDate	: Date
	});

	commentSchema.plugin(autoinc.plugin, { model: 'Comment', field: '_id' });

	return mongoose.model('Comment',commentSchema);
};

module.exports = new commentModel();