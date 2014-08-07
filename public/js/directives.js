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
                $("#register").slideUp(400,function(){
                    $('#login').slideDown();
                });
            });
        }
    }
});

app.directive('nav',function(){
    return {
        link: function($scope,element,attr){
            $("#menu-btn").click(function(){
                $("#menu").width("110px");
                $(this).hide();
            });
            $("#menu #close").click(function(){
                $("#menu").width("0px");
                $("#menu-btn").show();
            });
            $("#menu #open").click(function(){
                if($("#editorType").val()==="0"){
                    $(".editor_title").val("回复:"+$("#pageTitle").val()).attr("disabled","true");
                } else {
                    $(".editor_title").val("").removeAttr("disabled");
                }
                $(".editor").show();
            });
//            $("div").not("#menu-btn").not("#menu").click(function(){
//                $("#menu").width("0px");
//                $("#menu-btn").show();
//            });
        }
    }
})