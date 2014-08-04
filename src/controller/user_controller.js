var User = require('../database/user_model');
var async = require('async');
var MD5 = require('MD5');
(function (module) {
    module.list = function (req, res, next) {
        console.log("1111");
        return next(err);
    }
    module.get = function (req, res, next) {


    }

    module.login = function (req, res, next) {
        var criteria = req.body;
        if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(criteria.email) || criteria.email === undefined) {
            res.json({"result": "failed"});
            return;
        }
        if (!/^\w{6,20}$/.test(criteria.password) || criteria.password === undefined) {
            res.json({"result": "failed"});
            return;
        }
        criteria.password = MD5(criteria.password);
        User.findOne(criteria, {email: 1, nick: 1, face: 1, rank: 1, status: 1}, function (err, doc) {
            if (err) next(err);
            if (doc !== null) {
                if (doc.status === 0) {
                    User.update(criteria, {$set: {loginDate: new Date(), loginIp: req.ip}}, function (err, num) {
                        if (err) next(err);
                        if (num > 0) {
                            req.session.user = doc;
                            res.json({"result": "success"});
                        } else {
                            res.json({"result": "failed"});
                        }
                    })
                } else {
                    res.json({"result": "failed", "msg": "此账号无法使用"});
                }
            } else {
                res.json({"result": "failed"});
            }
        })
    }

    //注册
    module.register = function (req, res, next) {
        var criteria = req.body;
        if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(criteria.email) || criteria.email === undefined) {
            res.json({"result": "failed", "msg": "邮箱格式不正确"});
            return;
        }
        if (!/^\w{6,20}$/.test(criteria.password) || criteria.password === undefined) {
            res.json({"result": "failed", "msg": "密码格式不正确"});
            return;
        }
        if (!/^[A-Za-z0-9\u4e00-\u9fa5]{2,10}$/.test(criteria.nick) || criteria.nick === undefined) {
            res.json({"result": "failed", "msg": "昵称格式不正确"});
            return;
        }
        User.find({email: criteria.email}, function (err, doc) {
            if (err) next(err);
            if (doc.length === 0) {
                User.find({nick: criteria.nick}, function (err, nick) {
                    if (err) next(err);
                    if (nick.length === 0) {
                        criteria.password = MD5(criteria.password);
                        new User(criteria).save(function (err, doc) {
                            if (err) next(err);
                            if (doc !== undefined) {
                                res.json({"result": "success"});
                            } else {
                                res.json({"result": "failed"});
                            }
                        })
                    } else {
                        res.json({"result": "failed", "msg": "该昵称已存在"});
                    }
                })
            } else {
                res.json({"result": "failed", "msg": "该邮箱已注册过"});
            }
        })
    }
}(exports))