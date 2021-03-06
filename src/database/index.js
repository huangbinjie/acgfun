'use strict';
var mongoose = require('mongoose');
var autoinc = require('mongoose-id-autoinc');
var logger = require('../util/logger');
var MD5 = require('MD5');

var db = function () {
    return {
        config: function (settings) {
            mongoose.connect(settings.protocol + '://' + settings.host + '/' + settings.database);
            var db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', function callback() {
                logger.log('mongodb connection open');
            });
            db.on('close',function(){
                console.log("mongoose closed normal")
            });
            autoinc.init(db);
        },
        init: function () {
            var User = require('./user_model');
            var Team = require('./team_model');

            //初始化A,C,G,M四大版块
            Team.update({_id: -1}, {$set: {url: '/a', name: '动画'}}, {upsert: true}, function (err, num) {
                if (err) logger.error(err);
                if (num > 0) console.log(('/a初始化成功.').green);
                else console.log(('/a初始化失败.').green);
            })
            Team.update({_id: -2}, {$set: {url: '/c', name: '漫画'}}, {upsert: true}, function (err, num) {
                if (err) logger.error(err);
                if (num > 0) console.log(('/c初始化成功.').green);
                else console.log(('/c初始化失败.').green);
            })
            Team.update({_id: -3}, {$set: {url: '/g', name: '游戏'}}, {upsert: true}, function (err, num) {
                if (err) logger.error(err);
                if (num > 0) console.log(('/g初始化成功.').green);
                else console.log(('/g初始化失败.').green);
            })
            Team.update({_id: -4}, {$set: {url: '/m', name: '音乐'}}, {upsert: true}, function (err, num) {
                if (err) logger.error(err);
                if (num > 0) console.log(('/m初始化成功.').green);
                else console.log(('/m初始化失败.').green);
            })
            Team.update({_id: -4}, {$set: {url: '/o', name: '其他'}}, {upsert: true}, function (err, num) {
                if (err) logger.error(err);
                if (num > 0) console.log(('/o初始化成功.').green);
                else console.log(('/o初始化失败.').green);
            })
        }
    };
};

module.exports = db();