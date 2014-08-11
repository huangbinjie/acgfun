/**
 * Created by hbj on 2014/8/3.
 */
app.directive('login', function () {
    return {
        link: function ($scope, element, attr) {
            $("#change").click(function () {
                $("#login").slideUp(400, function () {
                    $('#register').slideDown();
                });
            });
            $("#cancel").click(function () {
                $("#register").slideUp(400, function () {
                    $('#login').slideDown();
                });
            });
        }
    }
});

app.directive('nav', function ($rootScope, $routeParams) {
    return {
        link: function ($scope, element, attr) {
            $("#menu-btn").click(function () {
                $("#menu").width("100px");
                $(this).hide();
            });
            $("#menu #close").click(function () {
                $("#menu").width("0px");
                $("#menu-btn").show();
            });
            $("#menu #open").click(function () {
                $rootScope.showEditor = true;
                if ($rootScope.editType === "reply") {
                    $(".editor_title").val("回复:" + $routeParams.title).attr("disabled", "true");
                } else if ($rootScope.editType === "post") {
                    $(".editor_title").val("").removeAttr("disabled");
                }
            });
        }
    }
})

app.directive('a', function ($loadingBar) {
    return {
        restrict: 'E',
        link: function ($scope, element, attr) {
            element.on("click", function (e) {
                $loadingBar("80%");
            })
        }
    }
})

app.directive('ngView', function () {
    return {
        restrict: 'C',
        link: function ($scope, element, attr) {
            element.on("click", function (e) {
                $("#menu").width("0px");
                $("#menu-btn").show();
            })
        }
    }
})
app.directive('editor', ['Post', 'Topic', '$rootScope', '$message','$routeParams',
    function (Post, Topic, $rootScope, $message,$routeParams) {
    return{
        restrict: "C",
        link: function ($scope, element, attr) {
            $('.editor .close').click(function () {
                $rootScope.$apply(function () {
                    $rootScope.showEditor = false;
                })
            });
        },
        controller: function ($scope,$location) {
            $scope.submit = function () {
                var title = $(".editor_title").val();
                var content = $(".editor iframe").contents().find("body").html();
                if (title === undefined || title === "" || title === null) {
                    $message("标题不能为空");
                    return;
                }
                if (content === undefined || content === "" || content === null) {
                    $message("请填写内容..");
                    return;
                }
                if ($rootScope.editType === "post") {
                    Post($location.path()).add({title: title, content: content}, function (data) {
                        if (data.result === "success") {
                            $message("发帖成功");
                            $(".editor_title").val("");
                            $(".editor iframe").contents().find("body").html("");
                        } else {
                            $message("发帖失败");
                        }
                    })
                }
                if ($rootScope.editType === "reply") {
                    Topic($location.path()).add({content:content,post_id:$routeParams.pid},function(data){
                        if (data.result === "success") {
                            $message("发帖成功");
                            $(".editor iframe").contents().find("body").html("");
                        } else {
                            $message("发帖失败");
                        }
                    })
                }

            }
        }
    }
}])