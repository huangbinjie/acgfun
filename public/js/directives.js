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
                if ($rootScope.editType === "post") {
                    $(".editor_title").val("").removeAttr("disabled");
                } else {
                    $(".editor_title").val("回复:" + $routeParams.title).attr("disabled", "true");
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
                    if ($rootScope.editType === "comment") {
                        Topic($location.path()).add({content: content, post_id: $routeParams.pid, post_user_id: $("#post_user_id").val()}, function (data) {
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
                    if($rootScope.editType ==="reply"){
                        Topic($location.path()).add({parent_id:$("#reply_author_id").val(),content: content, post_id: $routeParams.pid, post_user_id: $("#post_user_id").val()}, function (data) {
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
    }]);

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
            $(window).click(function () {
                $(".dropdown-menu").slideUp();
            })
        }
    }
})

app.directive('toTop', function ($window) {
    return{
        restrict: 'C',
        link: function ($scope, element, attr) {
            var window = angular.element($window);
            window.on('scroll', function () {
                if (window.scrollTop() > window.height()) {
                    element.css('opacity', "1");
                } else {
                    element.css('opacity', "0");
                }
            })
            element.on('click', function () {
                $window.scrollTo(0, 0);
            })
        }
    }
})

//广场状态
app.directive('plaza-panel', function () {
    return{
        restrict: 'C',
        link: function ($scope, element, attr) {

        }
    }
})
app.directive('plazaPanelBtn', function () {
    return{
        restrict: 'C',
        link: function ($scope, element, attr) {
            element.on('click', function () {
                if (angular.element(this).hasClass('light-orange')) {
                    angular.element(this).removeClass('light-orange');
                    angular.element(this).css('background', '#52c569');
                    $(".plaza-panel").slideUp();
                } else {
                    angular.element(this).addClass('light-orange');
                    angular.element(this).css('background', 'lightcoral');
                    $(".plaza-panel").slideDown();
                }
            })
        }
    }
})
app.directive('chatBtn', function () {
    return{
        restrict: 'C',
        link: function ($scope, element, attr) {
            element.on('click', function () {
                $('.chat-panel').toggle(500);
            })
        }
    }
})

app.directive('chatInput', function ($document, $rootScope, Auth) {
    return{
        restrict: 'C',
        link: function ($scope, element, attr) {
            $document.on('keydown', function (event) {
                if (event.which === 13) {
                    if (element.find('input').val() !== "") {
                        ws.send(JSON.stringify({path: '/plaza', suffix: '/chat', user: Auth.getUser(), message: element.find('input').val()}));
                        element.find('input').val("");
                    }
                }
            })
        }
    }
})

app.directive('chat', function ($document, Auth, $rootScope) {
    return{
        restrict: 'A',
        link: function ($scope, element, attr) {
            $document.on('keydown', function (event) {
                if (event.which === 13) {
                    if ($(".modal .reply").val() !== "") {
                        if ($('#toId').val() !== undefined && $('#toId').val() !== '') {
                            ws.send(JSON.stringify({path: '/', suffix: '/to', user: Auth.getUser(), to: $('#toId').val(), message: $(".modal .reply").val()}));
                            $('#chat_content_' + $('#toId').val()).append('<li class="personal">' + $(".modal .reply").val() + '</li>');
                            $("#chat_content_" + $('#toId').val()).scrollTop($("#chat_content_" + $('#toId').val())[0].scrollHeight);
                            $(".modal .reply").val("");
                        }
                    }
                }
            })

            $("button.reply-btn").click(function () {
                if ($(".modal .reply").val() !== "") {
                    if ($('#toId').val() !== undefined && $('#toId').val() !== '') {
                        ws.send(JSON.stringify({path: '/', suffix: '/to', user: Auth.getUser(), to: $('#toId').val(), message: $(".modal .reply").val()}));
                        $('#chat_content_' + $('#toId').val()).append('<li class="personal">' + $(".modal .reply").val() + '</li>');
                        $("#chat_content_" + $('#toId').val()).scrollTop($("#chat_content_" + $('#toId').val())[0].scrollHeight);
                        $(".modal .reply").val("");
                    }
                }
            })
        }
    }
})
//用户面板聊天
app.directive('userFunction', function ($rootScope, Auth, $message) {
    return{
        link: function ($scope, element, attr) {
        },
        controller: function ($scope) {
            //显示聊天框
            $rootScope.showChat = function (user) {
                if (Auth.getUser()._id === undefined) {
                    $message("请先登录");
                    return;
                }
                if ($("#chat_title_" + user._id).size() > 0) {
                    $("#chat_title_" + user._id).click();
                } else {
                    $('.modal.chat .left-panel').find('.active').removeClass('active');
                    $('.modal.chat .left-panel').prepend('<div class="row active" data-id="' + user._id + '" id="chat_title_' + user._id + '"><span>' + user.nick + '</span></div>');
                    $('.modal-body.message>ul.show').removeClass('show').addClass('hide');
                    $('.modal.chat .left-panel').after('<ul id="chat_content_' + user._id + '" class="right-panel clearfloat show">' +
                        '<li class="right"><a href="/user/' + user._id + '"><img class="face" src="uploads/faces/' + user.face + '"></a><div data-id="' + user._id + '" class="close">x</div></li>' +
                        '</ul>');
                    $('#chat_title_' + user._id).click(function () {
                        $('.modal.chat .left-panel').find(".active").removeClass('active');
                        $(this).addClass('active');
                        $('.modal-body.message>ul.show').removeClass('show').addClass('hide');
                        $('#chat_content_' + $(this)[0].dataset.id).removeClass("hide").addClass("show");
                        //设置toId
                        $("#toId").val($(this)[0].dataset.id);
                    })
                    //关闭个人对话框
                    $('#chat_content_' + user._id).find('.close').click(function () {
//                        显示下一个content
                        $(this).next().removeClass('hide').addClass('show');
//                        显示下个title
                        $("#chat_title_" + $(this)[0].dataset.id).next().addClass('active');
//                        删除此title
                        $('#chat_title_' + $(this)[0].dataset.id).remove();
//                        删除此content
                        $('#chat_content_' + $(this)[0].dataset.id).remove();
                    })
                }
                $rootScope.showChatModal = true;
                $('#toId').val(user._id);
            }
        }
    }
})

//回复
app.directive('reply', function ($rootScope) {
    return {
        link: function ($scope, element, attr) {
            element.on('click', function () {
                $rootScope.$apply(function () {
                    $rootScope.editType = "reply";
                    $rootScope.showEditor = true;
                })
                var commenter = attr.reply.split(',');//[_id,nick]
                $(".editor_title").val("回复:" + commenter[1]).attr("disabled", "true");
                $("#reply_author_id").val(commenter[0]);
            })
        },
        controller: function ($scope) {
        }
    }
})
