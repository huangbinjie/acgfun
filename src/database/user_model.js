'use strict';

var mongoose = require('mongoose'),
	autoinc  = require('mongoose-id-autoinc'),
	Schema	 = mongoose.Schema;


var userModel = function(){
	var userSchema = new Schema({
		email		: {type:String,match:/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,max:20,index:true,required:true,unique: true,sparse:true},//邮箱
		password	: {type:String,required:true},//密码
		nick		: {type:String,max:10},//昵称
		face		: String,//头像
		status		: {type:Number,default:1},//0 激活，1 关闭,
        hat_id     : String,//邮箱验证ID
		exp	        : {type:Number,default:0},//经验
		star		: [Number],//收藏
        follow     : [Number],//关注
        fans        : [Number],//粉丝
        message    : [{_id:Number,message:{type:String,max:200},read:{type:Number,default:0},date:{type:Date,default:Date.now}}],//消息 read 0 未读，1 已读,_id:from来源用户ID
		loginDate	: Date,//登陆时间
		loginIp	: String,//登陆IP
		rank		: {type:Number,default:1},//权限等级 0，admin，1普通用户
        online     : Number,//在线，0不在线 1在线
		createDate	: {type:Date,default:Date.now},//创建时间=注册时间
		modifyDate	: Date//修改时间
	});

	userSchema.plugin(autoinc.plugin, { model: 'User', field: '_id' });

	return mongoose.model('User',userSchema);
};

module.exports = new userModel();