var controllers = require('../controller');

module.exports = function(app){
	app.get('/',function(req,res){
		res.render('index',{title:"index"});
	});
	app.get('/user',controllers.user.list);
}