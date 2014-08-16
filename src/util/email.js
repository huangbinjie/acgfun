/**
 * Created by hbj on 2014/8/16.
 */
var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var transporter = nodemailer.createTransport();
module.exports.transporter = transporter;