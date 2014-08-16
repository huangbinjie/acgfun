/**
 * Created by hbj on 2014/8/16.
 */
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
module.exports.transporter = transporter;