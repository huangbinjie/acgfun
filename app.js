'use strict';
var express = require('express');
var http = require('http');
var path = require('path');
var environment = require('./src/config/environment');
var settings = require('./src/config/settings');
var mongodb = require('./src/database');
var app = express();

mongodb.config(settings.database);
mongodb.init();
var routes = require('./src/config/routes');
environment(app);
routes(app);

app.set('port', settings.port);

app.listen(app.get('port'), function() {
	console.log(('Acgfun is listening on port ' + settings.port).info);
});

module.exports = app;
