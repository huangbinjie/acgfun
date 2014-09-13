/**
 * Created by root on 14-9-5.
 */
var Post = require('../database/post_model');
var User = require("../database/user_model");
var Comment = require("../database/comment_model");
var async = require('async');
(function (module) {
    //版块最新评论
    module.main = function (req, res, next) {
        async.parallel({
            'a': function (callback) {
                Comment.find({parent_url: '/a'}, {post_id:1,user_id:1,content: 1, createDate: 1})
                    .populate('post_id', {title: 1})
                    .populate('user_id', {face: 1})
                    .sort({createDate: -1})
                    .limit(3)
                    .exec(function (err, doc) {
                        if (err) next(err);
                        callback(null, doc);
                    })
            },
            'c': function (callback) {
                Comment.find({parent_url: '/c'}, {post_id:1,user_id:1,content: 1, createDate: 1})
                    .populate('post_id', {title: 1})
                    .populate('user_id', {face: 1})
                    .sort({createDate: -1})
                    .limit(3)
                    .exec(function (err, doc) {
                        if (err) next(err);
                        callback(null, doc);
                    })
            },
            'g': function (callback) {
                Comment.find({parent_url: '/g'}, {post_id:1,user_id:1,content: 1, createDate: 1})
                    .populate('post_id', {title: 1})
                    .populate('user_id', {face: 1})
                    .sort({createDate: -1})
                    .limit(3)
                    .exec(function (err, doc) {
                        if (err) next(err);
                        callback(null, doc);
                    })
            },
            'm': function (callback) {
                Comment.find({parent_url: '/m'}, {post_id:1,user_id:1,content: 1, createDate: 1})
                    .populate('post_id', {title: 1})
                    .populate('user_id', {face: 1})
                    .sort({createDate: -1})
                    .limit(3)
                    .exec(function (err, doc) {
                        if (err) next(err);
                        callback(null, doc);
                    })
            },
            'o': function (callback) {
                Comment.find({parent_url: '/o'}, {post_id:1,user_id:1,content: 1, createDate: 1})
                    .populate('post_id', {title: 1})
                    .populate('user_id', {face: 1})
                    .sort({createDate: -1})
                    .limit(3)
                    .exec(function (err, doc) {
                        if (err) next(err);
                        callback(null, doc);
                    })
            }
        }, function (err, result) {
            if (err) next(err);
            res.json(result);
        })
    }

    //最新主题
    module.recent = function (req, res, next) {
        Post.find({deleteFlag: 0}, {parent_url: 1, user_id: 1, title: 1, createDate: 1})
            .sort({createDate: -1})
            .limit(5)
            .populate("user_id", {face: 1, nick: 1})
            .exec(function (err, docs) {
                if (err) next(err);
                res.json(docs);
            })
    }

    //论坛状态
    module.status = function (req, res, next) {
        async.parallel({
            userCount: function (callback) {
                User.count({status: 0}, function (err, num) {
                    if (err) next(err);
                    callback(null, num);
                })
            },
            postCount: function (callback) {
                Post.count({deleteFlag: 0}, function (err, num) {
                    if (err) next(err);
                    callback(null, num);
                })
            },
            commentCount: function (callback) {
                Comment.count({deleteFlag: 0}, function (err, num) {
                    if (err) next(err);
                    callback(null, num);
                })
            }
        }, function (err, result) {
            if (err) next(err);
            res.json(result);
        })
    }

    //活跃用户
    module.active = function (req, res, next) {
        User.find({status: 0}, {face: 1}, {sort: {exp: -1, loginDate: -1}, limit: 5}, function (err, docs) {
            if (err) next(err);
            res.json(docs)
        })
    }
}(exports))