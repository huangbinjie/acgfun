'use strict';

var mongoose = require('mongoose'),
	autoinc  = require('mongoose-id-autoinc'),
	Schema	 = mongoose.Schema;


var commentModel = function(){
	var commentSchema = new Schema({
		user_id		: {type:Number,ref:'User',required:true},//用户ID
		post_id		: {type:Number,ref:'Post',required:true},//文章ID
		content		: {type:String,required:true},//评论内容
		parent_id	: {type:Number,default:0,ref:'Comment'},
        deleteFlag  :{type:Number,default:0},//删除标志
		createDate	: {type:Date,default:Date.now},
		modifyDate	: Date
	});

	commentSchema.plugin(autoinc.plugin, { model: 'Comment', field: '_id' });

	return mongoose.model('Comment',commentSchema);
};

module.exports = new commentModel();