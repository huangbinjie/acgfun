var express = require('express');
var http = require('http');
var path = require('path');
var environment = require('./src/config/environment');
var routes = require('./src/config/routes');
var settings = require('./src/config/settings');
var app = express();

app.set('port', settings.port);
environment(app);
routes(app);

app.listen(app.get('port'), function() {
	console.log(('Acgfun is listening on port ' + settings.port).info);
});

module.exports = app;
