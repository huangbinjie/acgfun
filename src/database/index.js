'use strict';
var mongoose = require('mongoose');
var autoinc = require('mongoose-id-autoinc');
var logger = require('../util/logger');
var MD5 = require('MD5');

var db = function () {
    return {
        config: function (settings) {
            mongoose.connect(settings.protocol+'://' + settings.host + '/' + settings.database);
            var db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', function callback() {
                logger.log('mongodb connection open');
            });
            autoinc.init(db);
        },
        init: function () {
            var User = require('./user_model');

            //初始化admin账号
            User.update({_id:0},{$set:{email:"501711499@qq.com",password:MD5("hbj19900326"),rank:0}},{upsert:true},function(err,num){
                if(err) logger.error(err);
                if(num>0) console.log(('admin账号初始化成功.').green);
                else console.log(('admn账号初始化失败').red);
            });
}
};
};

module.exports = db();