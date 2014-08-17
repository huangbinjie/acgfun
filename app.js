'use strict';
var express = require('express');
var environment = require('./src/config/environment');
var settings = require('./src/config/settings');
var mongodb = require('./src/database');
var ws = require('./src/util/ws');
var app = express();
var http = require('http')
var server = http.createServer(app)

mongodb.config(settings.database);
mongodb.init();
environment(app);
var routes = require('./src/config/routes');
routes(app);

app.set('port', settings.port);

ws(server);

server.listen(settings.port,function(){
    console.log(('Acgfun is listening on port ' + settings.port).info);
});

module.exports = app;
