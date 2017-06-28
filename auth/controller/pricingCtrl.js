/**
 * Created by Damith on 6/19/2016.
 */

mainApp.controller('pricingCtrl', function ($rootScope, $scope, $state,
                                            loginService, walletService, $anchorScroll) {
    $anchorScroll();

    //on load get my package
    $scope.packages = [];
    $scope.myCurrentPackage = null;
    loginService.getAllPackages(function (result) {
        $scope.packages = result;
        //get my package
        loginService.getMyPackages(function (status, res, data) {
            if (status && data && data.Result) {
                $scope.myCurrentPackage = data.Result[0];
                for (var i = 0; i < $scope.packages.length; i++) {
                    if ($scope.packages[i].packageName == data.Result[0]) {
                        $scope.packages[i]['disable'] = true;
                        $scope.packages[i]['active'] = true;
                        i = $scope.packages.length;
                    } else {
                        $scope.packages[i]['disable'] = true;
                    }
                }
            }
        })
    });

    $scope.showMessage = function (tittle, content, type) {

        new PNotify({
            title: tittle,
            text: content,
            type: type,
            styling: 'bootstrap3'
        });
    };

    //onclick get my package
    $scope.onClickBuyPackages = function (pak) {
        walletService.CreditBalance().then(function (res) {
            if ((parseInt(res.Credit) / 100) >= parseInt(pak.price)) {
                loginService.buyMyPackage(pak.packageName, function (result, data) {
                    if (!result) {
                        $scope.showMessage("Package Buy", "Please Contact System Administrator.", 'error');
                        return;

                    }
                    else {
                        loginService.clearCookie();
                        //$state.go('login');
                        $scope.showMessage("Package Buy", "Package upgrade was done successfully.", 'Success');
                        return;
                    }
                });
            }
            else {
                $scope.showMessage("Package Buy", "Insufficient Balance. Please Add Credit To Your Account.", 'error');
                $state.go('console.credit');
            }
        }, function (err) {
            $scope.showMessage("Package Buy", "Fail To Get Credit Balance.", 'error');
        });
    };


});
