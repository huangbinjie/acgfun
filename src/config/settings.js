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
    email: {
        register:"感谢你注册acgfun，请点击下方链接激活<br/>",
        reset:"您使用了重置密码功能，请点击下方链接<br/>"
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
