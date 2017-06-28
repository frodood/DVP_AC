/**
 * Created by Pawan on 6/13/2016.
 */
mainApp.controller("holdMusicController", function ($scope, $state, holdMusicBackendService, loginService) {

    $scope.holdMusicList = [];
    $scope.holdMusicFiles = [];
    $scope.addNew = false;
    $scope.searchCriteria = "";

    $scope.showAlert = function (title, content, type) {

        new PNotify({
            title: title,
            text: content,
            type: type,
            styling: 'bootstrap3'
        });
    };

    $scope.GetHoldMusic = function () {
        holdMusicBackendService.getHoldMusic().then(function (response) {

            if (!response.data.IsSuccess) {
                console.info("Error in picking Hold Music list " + response.data.Exception);
            }
            else {
                $scope.holdMusicList = response.data.Result;
                //$scope.MasterAppList = response.data.Result;
            }

        }, function (error) {
            loginService.isCheckResponse(error);
            console.info("Error in picking Hold music  " + error);
        });
    };

    $scope.GetHoldMusicFiles = function () {
        holdMusicBackendService.getHoldMusicFiles().then(function (response) {

            if (!response.data.IsSuccess) {
                console.info("Error in picking Hold Music list " + response.data.Exception);
            }
            else {
                $scope.holdMusicFiles = response.data.Result;
                $scope.addNew = !$scope.addNew;
                //$scope.MasterAppList = response.data.Result;
            }

        }, function (error) {
            loginService.isCheckResponse(error);
            console.info("Error in picking Hold music  " + error);
        });
    };

    $scope.addHoldMusic = function () {

        $scope.GetHoldMusicFiles();
    };
    $scope.cancelSave = function () {
        $scope.addNew = false;
    };

    $scope.saveHoldMusic = function (resource) {

        if ($scope.newHoldMusic.AnnouncementTime == "" || $scope.newHoldMusic.AnnouncementTime == null) {
            $scope.newHoldMusic.AnnouncementTime = 0;
        }

        holdMusicBackendService.saveHoldMusicFiles(resource).then(function (response) {

            if (!response.data.IsSuccess) {
                console.info("Error in adding new Hold Music " + response.data.Exception);
                $scope.showAlert("Error", "Error in saving ", "error");
            }
            else {
                $scope.addNew = !response.data.IsSuccess;

                $scope.holdMusicList.splice(0, 0, response.data.Result);
                $scope.newHoldMusic = {};
                $scope.showAlert("Success", "Saving succeeded", "success");
                $scope.searchCriteria = "";


            }

        }, function (error) {
            loginService.isCheckResponse(error);
            console.info("Exception in adding new Hold Music " + error);
            $scope.showAlert("Error", "Error in saving ", "error");
        });
    };

    $scope.reloadMusicListPage = function () {
        $state.reload();
    };

    $scope.removeDeleted = function (item) {


        var index = $scope.holdMusicList.indexOf(item);
        if (index != -1) {
            $scope.holdMusicList.splice(index, 1);
            $scope.showAlert("Success", "Successfully removed", "success");
        }
        else {
            $scope.showAlert("Error", "Error in removing ", "error");
        }

    };

    $scope.GetHoldMusic();

    $scope.makeFirstAnnounementEmpty = function () {
        $scope.newHoldMusic.FirstAnnounement = null;
    };
    $scope.makeMOHEmpty = function () {
        $scope.newHoldMusic.MOH = null;
    };
    $scope.makeAnnouncementEmpty = function () {
        $scope.newHoldMusic.Announcement = null;
    };

});