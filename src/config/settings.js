var path = require('path');
var colors = require('colors');

var settings = {
    path: path.normalize(path.join(__dirname, '../../')),
    port: process.env.NODE_PORT || 80,
    database: {
        protocol: "mongodb", // or "mysql"
        query: { pool: true },
        host: "localhost",
        database: "acgfun",
        user: "acgfun",
        password: "hbj_acgfun"
    },
    mail: {
        from: 'admin@acgfun.cn', // sender address
        to: '501711499@qq.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello ✔', // plaintext body
        html: '<b>这是acgfun给您发送的邮件，请确认</b>' // html body
    }
}
;

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

module.exports = settings;
