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
app.directive('editor', ['Post', 'Topic', '$rootScope', '$message', '$routeParams',
    function (Post, Topic, $rootScope, $message, $routeParams) {
        return{
            restrict: "C",
            link: function ($scope, element, attr) {
                $('.editor .close').click(function () {
                    $rootScope.$apply(function () {
                        $rootScope.showEditor = false;
                    })
                });
            },
            controller: function ($scope, $location) {
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
                                $rootScope.showEditor = false;
                                $rootScope.$broadcast("postSuccess");
                            } else {
                                $message("发帖失败");
                            }
                        })
                    }
                    if ($rootScope.editType === "reply") {
                        Topic($location.path()).add({content: content, post_id: $routeParams.pid,post_user_id:$("#post_user_id").val()}, function (data) {
                            if (data.result === "success") {
                                $message("发帖成功");
                                $(".editor iframe").contents().find("body").html("");
                                $rootScope.showEditor = false;
                                $rootScope.$broadcast("postSuccess");
                            } else {
                                $message("发帖失败");
                            }
                        })
                    }

                }
            }
        }
    }])

app.directive('compile', function ($compile) {
    return {
        restrict: 'A',
        link: function ($scope, element, attr) {
            $scope.$watch(attr.compile, function (text) {
                element.html(text);
                $compile(element.contents())($scope);
            });
        }
    }
})

app.directive("dropdown", function () {
    return{
        link: function ($scope, element, attr) {
            element.on('click', function (e) {
                e.stopPropagation();
                $(this).find(".dropdown-menu").slideDown();
            })
            $(window).click(function(){
                $(".dropdown-menu").slideUp();
            })
        }
    }
})

app.directive('toTop',function($window){
    return{
        restrict:'C',
        link:function($scope,element,attr){
            var window = angular.element($window);
            window.on('scroll',function(){
                if(window.scrollTop()>window.height()){
                    element.css('opacity',"1");
                } else {
                    element.css('opacity',"0");
                }
            })
            element.on('click',function(){
                $window.scrollTo(0,0);
            })
        }
    }
})

//广场状态
app.directive('plaza-panel',function(){
    return{
        restrict:'C',
        link:function($scope,element,attr){

        }
    }
})
app.directive('plazaPanelBtn',function(){
    return{
        restrict:'C',
        link:function($scope,element,attr){
            element.on('click',function(){
                if(angular.element(this).hasClass('light-orange')){
                    angular.element(this).removeClass('light-orange');
                    angular.element(this).css('background','#52c569');
                    $(".plaza-panel").slideUp();
                } else {
                    angular.element(this).addClass('light-orange');
                    angular.element(this).css('background','lightcoral');
                    $(".plaza-panel").slideDown();
                }
            })
        }
    }
})
app.directive('chatBtn',function(){
    return{
        restrict:'C',
        link:function($scope,element,attr){
            element.on('click',function(){
                $('.chat-panel').toggle(500);
            })
        }
    }
})

app.directive('chatInput',function($document,$rootScope,Auth){
    return{
        restrict:'C',
        link:function($scope,element,attr){
            $document.on('keydown',function(event){
                if(event.which===13){
                    if(element.find('input').val()!==""){
                        ws.send(JSON.stringify({path:'/plaza',suffix:'/chat',user:Auth.getUser(),message:element.find('input').val()}));
                        element.find('input').val("");
                    }
                }
            })
        }
    }
})
