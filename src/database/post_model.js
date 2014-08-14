'use strict';

var mongoose = require('mongoose'),
	autoinc  = require('mongoose-id-autoinc'),
	Schema	 = mongoose.Schema;


var postModel = function(){
	var postSchema = new Schema({
		parent_url		: {type:String,required:true,index:true,ref:'Team'},//父路径，版块路径
		user_id		: {type:Number,ref:'User',required:true},//用户ID
		title		: {type:String,max:50,required:true},//标题
		content		: {type:String,required:true},//文本
		order		: {type:Number,default:0},//排序方式，应该按从大到小排
        view        :{type:Number,default:0},//浏览次数
        deleteFlag  :{type:Number,default:0},//删除标志
		createDate	: {type:Date,default:Date.now},
		modifyDate	: Date
	});

	postSchema.plugin(autoinc.plugin, { model: 'Post', field: '_id' });

	return mongoose.model('Post',postSchema);
};

module.exports = new postModel();