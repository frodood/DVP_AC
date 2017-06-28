/**
 * Created by Pawan on 5/29/2017.
 */
mainApp.controller("fileCatRestrictController", function ($scope, $state, userProfileApiAccess,fileService, loginService,$anchorScroll) {

    $anchorScroll();
    $scope.addNew = false;
    $scope.ArdsList = [];
    $scope.tasks = [];
    $scope.groups = [];
    $scope.attributeGroups = [];
    $scope.attributeGroup;
    $scope.RequestServers = [];

    $scope.AdminUsers =[];
    $scope.FileCategories=[];
    $scope.FileCategoryNames=[];

    $scope.showAlert = function (title, content, type) {

        new PNotify({
            title: title,
            text: content,
            type: type,
            styling: 'bootstrap3'
        });
    };


    $scope.loadUsers = function () {

        userProfileApiAccess.getUsersByRole().then(function (response) {

            if(response.IsSuccess)
            {
                $scope.AdminUsers=response.Result;
            }
            else
            {
                $scope.showAlert("Error","Error in loading Admin user details","error");
            }
        },function (error) {
            $scope.showAlert("Error","Error in loading Admin user details","error");
            console.log(error);
        });
    };

    $scope.loadFileCategoryList = function () {
        fileService.GetCatagories().then(function (response) {

            if(response)
            {
                $scope.FileCategories=response;
                $scope.FileCategoryNames=$scope.FileCategories.map(function (item) {

                    return item.Category;
                });

            }


        },function (error) {
            console.log(error);
        });
    }


    $scope.loadUsers();
    $scope.loadFileCategoryList();







    /*$scope.GetARDSRecords();
    $scope.LoadTasks();
    $scope.LoadGroups();
    $scope.LoadServers();*/

});