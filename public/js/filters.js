/**
 * Created by hbj on 2014/8/9.
 */
app.filter('dateCustom', function () {
    return function (input) {
        var date = Date.now() - new Date(input).getTime();
        //3600000
        if (date < 60000)
            return Math.round(date / 1000) + "秒前";
        if (date < 3600000)
            return Math.round(date / 60000) + "分钟前";
        if (date < 86400000)
            return Math.round(date / 3600000) + "小时前";
        if (date < 604800000)
            return +Math.round(date / 86400000) + "天前";
        if (date < 2592000000)
            return Math.round(date / (86400000 * 7)) + "星期前";
        if (date < 31536000000)
            return Math.round(date / (86400000 * 30)) + "个月前";
        return Math.round(date / 31536000000) + "年前";
    }
})