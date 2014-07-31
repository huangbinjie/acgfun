var express = require('express');
var http = require('http');
var path = require('path');
var environment = require('./src/config/environment');
var routes = require('./src/config/routes');
var app = express();

module.exports = app;
