// var passport = require('passport');
// var passport-local = require('passport-local');

module.exports= function(req, res, next){console.log("1111111111111");
	if(!req.session){
		res.redirect('index');
	}else{
	next();
}
}