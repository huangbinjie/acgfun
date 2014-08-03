/**
 * Created by hbj on 2014/8/3.
 */
app.factory('User', ['$resource', function ($resource) {
    return $resource("/user", {}, {
        query: {method: "GET"}
    });
}]);

app.factory('$message', function ($timeout) {
    var $message = function (message, top) {
        var width = ($("body").width() - $("#message").width()) / 2;
        $('#message').html(message).css({"opacity": ".8", "left": width, "top": top !== undefined ? top : 100});
        $timeout(function () {
            $('#message').css({"opacity": "0", "left": width, "top": -100});
        }, 3000);
    };
    return $message;
});

app.factory('$loadingBar', function ($timeout, $location) {
    var load = function (width, path) {
        $(".loading-bar").remove();
        $("#background-img").after("<div class='loading-bar'></div>");
        $(".loading-bar").width(width);
        if (width === "100%") {
            $timeout(function () {
                $(".loading-bar").remove();
            }, 1000);
        }
        if (path) {
            $location.path(path);
        }
    }
    return load;
});
