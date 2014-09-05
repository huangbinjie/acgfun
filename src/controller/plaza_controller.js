/**
 * Created by root on 14-9-5.
 */
var Post = require('../database/post_model');
var User = require("../database/user_model");
var Comment = require("../database/comment_model");
var async = require('async');
(function (module) {
    module.recent = function(req,res,next){
        Post.find({},{parent_url:1,user_id:1,title:1,createDate:1})
            .sort({createDate:-1})
            .limit(10)
            .populate("user_id",{face:1,nick:1})
            .exec(function(err,docs){
                if(err) next(err);
                res.json(docs);
            })
    }

    module.status = function (req, res, next) {
        async.parallel({
            userCount: function (callback) {
                User.count({status:0},function (err, num) {
                    if (err) next(err);
                    callback(null,num);
                })
            },
            postCount: function (callback) {
                Post.count({deleteFlag:0},function (err, num) {
                    if (err) next(err);
                    callback(null,num);
                })
            },
            commentCount: function (callback) {
                Comment.count({deleteFlag:0},function (err, num) {
                    if (err) next(err);
                    callback(null,num);
                })
            }
        }, function (err, result) {
            if (err) next(err);
            res.json(result);
        })
    }
}(exports))