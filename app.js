'use strict';
var express = require('express');
var environment = require('./src/config/environment');
var settings = require('./src/config/settings');
var mongodb = require('./src/database');
var app = express();
var http = require('http')
var server = http.createServer(app)

mongodb.config(settings.database);
mongodb.init();
var ws = require('./src/util/ws');
environment(app);
var routes = require('./src/config/routes');
routes(app);

app.set('port', settings.port);

var wss = ws.start(server);

server.listen(settings.port,function(){
    console.log(('Acgfun is listening on port ' + settings.port).info);
});

module.exports = app;
