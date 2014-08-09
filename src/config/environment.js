var http = require('http');
var path = require('path');
var express = require('express');
var favicon = require('static-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('../util/logger');
var session = require('express-session');


module.exports = function (app) {
    app.configure(function () {
        // view engine setup
        app.set('views', path.join(__dirname, '../../views'));
        app.set('view engine', 'jade');

        app.use(favicon());
        app.use(morgan('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded());
        app.use(cookieParser());
        app.use(require('stylus').middleware(path.join(__dirname, '../../public')));
        app.use(express.static(path.join(__dirname, '../../public')));
        app.use(session({name: "acgfun", secret: 'acgfun', resave: false, saveUninitialized: false}));
        app.use(app.router);


/// catch 404 and forwarding to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

/// error handlers

// development error handler
// will print stacktrace
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                if(err.status===404){
                    res.redirect('index.html#/'+req.url);
                } else {
                    res.render('error', {
                        message: err.message,
                        error: err
                    });
                }
                logger.error("用户名:" + (req.session.user !== undefined ? req.session.user.email : "未登陆用户,请求地址:") + req.url + ",错误:" + err.message);
            });
        }

// production error handler
// no stacktraces leaked to user
        app.use(function (err, req, res, next) {
            res.render('error', {
                message: err.message,
                error: err
            });
            logger.error("用户名:" + (req.session.user !== undefined ? req.session.user.email : "未登陆用户,请求地址:") + req.url + ",错误:" + err.message);
        });
    });
};
