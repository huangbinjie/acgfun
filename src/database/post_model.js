'use strict';

var mongoose = require('mongoose'),
	autoinc  = require('mongoose-id-autoinc'),
	Schema	 = mongoose.Schema;


var postModel = function(){
	var postSchema = new Schema({
		team_id		: {type:Number,ref:'Team'},//分组(分类)ID
		user_id		: {type:Number,ref:'User'},//用户ID
		title		: {type:String,max:50,index:true,required:true},//标题
		content		: {type:String,required:true},//文本
		comment_id	: {type:Number,ref:'Comment'},//评论ID
		order		: {type:Number,default:0},//排序方式，应该按从大到小排
		createDate	: Date,
		modifyDate	: Date
	});

	postSchema.plugin(autoinc.plugin, { model: 'Post', field: '_id' });

	return mongoose.model('Post',postSchema);
};

module.exports = new postModel();