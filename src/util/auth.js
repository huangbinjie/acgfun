// var passport = require('passport');
// var passport-local = require('passport-local');

module.exports.ensureAuthenticated= function(req, res, next){
	if(!req.session){
		res.redirect('/');
	} else {
		next();
	}
}
module.exports.ensureRank1= function(req, res, next){
	if(req.session){
		if(!req.session.user.rank){
			res.redirect('/');
		}else{
			next();
		}
	} else {
		res.redirect('/');
	}
}