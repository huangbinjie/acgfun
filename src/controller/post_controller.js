/**
 * Created by hbj on 2014/8/9.
 */
var Post = require('../database/post_model');
var Team = require('../database/team_model');
var Comment = require('../database/comment_model');
var async = require('async');
(function (module) {
    /*
     返回结果:{_id,title,user_id:{face},createDate,view,profile:{replyCount,commenter:{face,createDate}}}
     */
    module.list = function (req, res, next) {
        var skip = 0;
                Post.find({parent_url: req.url}, {_id: 1, user_id: 1, title: 1, view: 1, createDate: 1}, {skip: skip, limit: 30, sort: "order"})
                    .populate('user_id', "face")
                    .exec(function (err, docs) {
                        if (err) next(err);
                        async.each(docs, function (doc, callback) {
                            async.parallel({
                                    replyCount: function (callback) {
                                        Comment.find({post_id: doc._id}).count(function (err, num) {
                                            if (err) next(err);
                                            callback(null, num);
                                        })
                                    },
                                    commenter: function (callback) {
                                        commenter:Comment.find({post_id: doc._id}, "user_id,createDate").sort({createDate: -1}).limit(1).populate("user_id", "face").exec(function (err, comment) {
                                            if (err) next(err);
                                            callback(null, {replyDate: comment.createDate, face: comment.user_id === undefined ? null : comment.user_id.face});
                                        })
                                    }
                                },
                                function (err, result) {
                                    if (err) next(err);
                                    doc._doc.profile = result;
                                    callback();
                                }
                            )
                        }, function (err) {
                            if (err) next(err);
                            res.json(docs);
                        })
                    })
    }

    module.put = function (req, res, next) {
        var criteria = req.body;
        if (criteria.title === undefined || criteria.title === "" || criteria.title === null) {
            return;
        }
        if (criteria.content === undefined || criteria.content === "" || criteria.content === null) {
            return;
        }
        criteria.parent_url = req.url;
        criteria.user_id = req.session.user._id;
        new Post(criteria).save(function (err, doc) {
            if (err) next(err);
            if (doc !== undefined) {
                res.json({"result": "success"});
            } else {
                res.json({"result": "failed"});
            }
        })
    }

    /*topic页面*/
    module.getTopic = function (req, res, next) {
        var pid = req.params.pid;
        async.parallel({
            comments: function (callback) {
                Comment.find({post_id: pid}, {_id:1,user_id:1,content:1}).sort({_id: 1}).populate("user_id", "face,nick").exec(function (err, docs) {
                    if (err) next(err);
                    callback(null, docs);
                })
            },
            topic: function (callback) {
                Post.findOne({_id:pid},{_id:1,user_id:1,title:1,content:1}).populate('user_id',"face,nick").exec(function(err,docs){
                    if (err) next(err);
                    callback(null, docs);
                })
            }}, function (err, result) {
            if (err) next(err);
            res.json(result);
        })
    }

    module.putComment = function(req,res,next){
        var comment = req.body;
        if(comment.content===undefined||comment.content===""||comment.content===null){
            res.jspn({"result":"failed"});
            return;
        }
        comment.user_id = req.session.user._id;
        new Comment(comment).save(function(err,doc){
            if(err) next(err);
            if(doc !== undefined) res.json({"result":"success"});
            else res.json({"result":"failed"});
        })
    }
}(exports))