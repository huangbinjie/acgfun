'use strict';

var mongoose = require('mongoose'),
	autoinc  = require('mongoose-id-autoinc'),
	Schema	 = mongoose.Schema;


var userModel = function(){
	var userSchema = new Schema({
		email		: {type:String,match:/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,max:20,index:true,required:true,unique: true,sparse:true},//邮箱
		password	: {type:String,max:20,required:true},//密码
		nick		: {type:String,max:20},//昵称
		face		: String,//头像
		status		: {type:Number,default:0},//0 激活，1 关闭,
		reputation	: {type:Number,default:0},//声望=积分
		star		: [{type:Number,ref:'Post'}],//收藏
		loginDate	: Date,//登陆时间
		loginIp		: String,//登陆IP
		rank		: {type:Number,default:1},//权限等级 0，admin，1普通用户
		createDate	: {type:Date,default:Date.now()},//创建时间=注册时间
		modifyDate	: Date//修改时间
	});

	userSchema.plugin(autoinc.plugin, { model: 'User', field: '_id' });

	return mongoose.model('User',userSchema);
};

module.exports = new userModel();