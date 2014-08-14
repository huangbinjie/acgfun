// var passport = require('passport');
// var passport-local = require('passport-local');

module.exports.ensureAuthenticated= function(req, res, next){
	if(!req.session.user){
		res.redirect('/');
	} else {
		next();
	}
}
module.exports.ensureRank= function(req, res, next){
	if(req.session.user){
		if(req.session.user.rank===1){
			res.redirect('/');
		}else{
			next();
		}
	} else {
		res.redirect('/');
	}
}