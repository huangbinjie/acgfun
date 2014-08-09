'use strict';

var mongoose = require('mongoose'),
	autoinc  = require('mongoose-id-autoinc'),
	Schema	 = mongoose.Schema;


var teamModel = function(){
	var teamSchema = new Schema({
        url:{type:String,required:true},//版块路径
		name:String,//版块名称
		img	:String,//版块图片
        parent_url:String,//父版块ID
        createDate	: {type:Date,default:Date.now},
        modifyDate	: Date
	});

	teamSchema.plugin(autoinc.plugin, { model: 'Team', field: '_id' });

	return mongoose.model('Team',teamSchema);
};

module.exports = new teamModel();