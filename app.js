'use strict';
var express = require('express');
var environment = require('./src/config/environment');
var settings = require('./src/config/settings');
var mongodb = require('./src/database');
var app = express();


mongodb.config(settings.database);
mongodb.init();
environment(app);
var routes = require('./src/config/routes');
routes(app);

app.set('port', settings.port);

app.listen(app.get('port'), function() {
	console.log(('Acgfun is listening on port ' + settings.port).info);
});

module.exports = app;
