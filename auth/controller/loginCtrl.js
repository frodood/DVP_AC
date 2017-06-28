/**
 * Created by Damith on 6/1/2016.
 */

mainApp.controller('loginCtrl', function ($rootScope, $scope, $state, $http,
                                          loginService,
                                          config, $base64, $auth) {

    $scope.CheckLogin = function () {
        if ($auth.isAuthenticated()) {

            loginService.getUserNavigation(function (isnavigation) {
                if (isnavigation) {
                    $state.go('console');
                }
            })

        }
    };

    var para = {
        userName: null,
        password: null,
        clientID: $base64.encode(config.client_Id_secret),
    };

    var showAlert = function (title, type, content) {
        new PNotify({
            title: title,
            text: content,
            type: type,
            styling: 'bootstrap3',
            animate: {
                animate: true,
                in_class: "bounceIn",
                out_class: "bounceOut"
            }
        });
    };

    $scope.isLogin = false;

    $scope.onClickSignUp = function () {
        $state.go('signUp');
    };

    $scope.isSocialMedia = false;
    $scope.authenticate = function (provider) {

        para.scope = ["all_all", "profile_veeryaccount"];

        $scope.isSocialMedia = true;
        $auth.authenticate(provider, para)
            .then(function () {
                //toastr.success('You have successfully signed in with ' + provider + '!');
                loginService.getMyPackages(function (result, status) {
                    if (status == 200) {
                        if (result) {
                            loginService.getUserNavigation(function (isnavigation) {
                                $scope.isSocialMedia = false;
                                $state.go('console');

                            })
                        } else {
                            $scope.isSocialMedia = false;
                            $state.go('pricing');
                        }
                    } else {
                        loginService.getUserNavigation(function (isnavigation) {
                            $scope.isSocialMedia = false;
                            $state.go('console');
                        })
                    }
                });
            })
            .catch(function (error) {
                $scope.isSocialMedia = false;
                if (error.message) {
                    loginService.clearCookie();
                    showAlert('Error', 'error', error.message);
                } else if (error.data && error.data.message) {
                    loginService.clearCookie();
                    showAlert('Error', 'error', error.data.message);
                } else {
                    loginService.clearCookie();
                    showAlert('Error', 'error', 'Please check login details...');
                }
            });
    };

    $scope.onClickLogin = function () {
        para.userName = $scope.userName;
        para.password = $scope.password;
        para.scope = ["all_all", "profile_veeryaccount"];
        para.console = "SUPERVISOR_CONSOLE";
        //parameter option
        //username
        //password
        //decode clientID
        $scope.isLogin = true;
        $scope.loginFrm.$invalid = true;


        var params = {
            headers: {
                Authorization: 'Basic ' + $base64.encode(config.client_Id_secret)
            }
        };

        $auth.login(para, params)
            .then(function () {
                loginService.getMyPackages(function (result, status) {

                    if (status == 200) {
                        if (result) {
                            loginService.getUserNavigation(function (isnavigation) {
                                if (isnavigation)
                                    $state.go('console');
                                //else
                                // $state.go('login');
                            })
                        } else {
                            if (loginService.isOwner() == 'admin') {
                                $state.go('console.pricing');
                            } else {
                                $state.go('login');
                            }
                        }
                    } else {

                        loginService.getUserNavigation(function (isnavigation) {
                            if (isnavigation)
                                $state.go('console');
                        })
                    }
                });
            })
            .catch(function (error) {
                if (error.status == 449) {
                    showAlert('Account Info', 'warning', 'Please ' + error.data.message);
                } else {
                    showAlert('Error', 'error', 'Please check login details...');

                }
                $scope.isLogin = false;
                $scope.loginFrm.$invalid = false;
            });


        /*
         loginService.Login(para, function (result) {
         if (result) {
         loginService.getMyPackages(function (result, status) {
         if (status == 200) {
         if (result) {
         loginService.getUserNavigation(function (isnavigation) {

         $state.go('console');

         })
         } else {

         $state.go('pricing');
         }
         } else {

         loginService.getUserNavigation(function (isnavigation) {
         $state.go('console');
         })
         }
         });
         } else {
         showAlert('Error', 'error', 'Please check login details...');
         $scope.isLogin = false;
         $scope.loginFrm.$invalid = false;
         }
         });*/
    };

    $scope.CheckLogin();


    $scope.onClickResetPassword = function () {

        $state.go('ResetPw');

        //loginService.resetPassword($scope.password, function (isSuccess) {
        //    if(isSuccess){
        //        showAlert('Success', 'success', "Please check email");
        //    }else{
        //        showAlert('Error', 'error', "reset failed");
        //    }
        //})


    }


});