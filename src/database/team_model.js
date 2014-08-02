'use strict';

var mongoose = require('mongoose'),
	autoinc  = require('mongoose-id-autoinc'),
	Schema	 = mongoose.Schema;


var teamModel = function(){
	var teamSchema = new Schema({
		name:String,
		img	:String
	});

	teamSchema.plugin(autoinc.plugin, { model: 'Post', field: '_id' });

	return mongoose.model('Post',teamSchema);
};

module.exports = new teamModel();