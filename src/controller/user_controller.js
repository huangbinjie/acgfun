  var User = require('../database/user_model');
  var async = require('async');
  var MD5 = require('MD5');
  (function(module){
	module.list = function(req,res,next){
		console.log("1111");
		return next(err);
	}
	module.get = function(req,res,next){
		

	}

    module.login = function(req,res,next){
        var criteria = req.body;
        if(criteria.email===undefined){
            res.jsonp({"result":"failed"});
            return;
        }
        if(criteria.password===undefined){
            res.jsonp({"result":"failed"});
            return;
        }
        if(!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(criteria.email)){
            res.jsonp({"result":"failed"});
            return;
        }
        if(!/^\w{6,20}$/.test(criteria.password)){
            res.jsonp({"result":"failed"});
            return;
        }
        criteria.password = MD5(criteria.password);
        User.findOne(criteria,{email:1,nick:1,face:1,rank:1,status:1},function(err,doc){
            if(err) next(err);
            if(doc!==null){
                if(doc.status===0){
                    req.session.user = doc;
                    res.jsonp({"result":"success"});
                } else {
                    res.jsonp({"result":"failed","msg":"此账号无法使用"});
                }
            } else {
                res.jsonp({"result":"failed"});
            }
        })
    }
}(exports))