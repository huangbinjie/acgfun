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