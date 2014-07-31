var controllers = require('../controller');

module.exports = function(app){
	app.get('/user',controller.user);
}