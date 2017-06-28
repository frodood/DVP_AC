/**
 * Created by Heshan.i on 1/13/2017.
 */

(function(){

    var app =angular.module('veeryConsoleApp');

    var acwDetailController = function($scope, $state, acwDetailApiAccess, resourceService, loginService) {

        $scope.pagination = {
            currentPage : 1
        };

        $scope.obj = {
            startDay: moment().format("YYYY-MM-DD"),
            endDay: moment().format("YYYY-MM-DD")
        };

        $scope.startTime = '12:00 AM';
        $scope.endTime = '11:59 PM';

        $scope.attrList = [];

        $scope.showTable = false;


        var getSkillList = function () {

            resourceService.GetAttributes().then(function (attrList) {
                if (attrList && attrList.length > 0) {
                    $scope.attrList = attrList;
                }


            }).catch(function (err) {
                loginService.isCheckResponse(err);
            });
        };
        getSkillList();

        $scope.getResourceDetails = function(){
            acwDetailApiAccess.GetResourceDetails().then(function(response){
                if(response.IsSuccess)
                {
                    $scope.resourceDetails = response.Result;
                }
                else
                {
                    var errMsg = response.CustomMessage;

                    if(response.Exception)
                    {
                        errMsg = response.Exception.Message;
                    }
                    $scope.showAlert('ACW Details', errMsg, 'error');
                }
            }, function(err){
                loginService.isCheckResponse(err);
                var errMsg = "Error occurred while loading resource details";
                if(err.statusText)
                {
                    errMsg = err.statusText;
                }
                $scope.showAlert('ACW Details', errMsg, 'error');
            });
        };

        $scope.getAcwSummery = function(){
            $scope.showTable = false;
            $scope.totalAcwSessions = 0;
            $scope.totalAcwTime = 0;
            $scope.averageAcwTime = 0;

            $scope.showPaging = false;

            $scope.pageSize = 20;


            $scope.obj.isTableLoading = 0;

            $scope.allAcwRecords = [];


            var st = moment($scope.startTime, ["h:mm A"]).format("HH:mm");
            var et = moment($scope.endTime, ["h:mm A"]).format("HH:mm");
            $scope.obj.isTableLoading = 0;
            var momentTz = moment.parseZone(new Date()).format('Z');
            momentTz = momentTz.replace("+", "%2B");

            var startDate = $scope.obj.startDay + ' ' + st + ':00' + momentTz;
            var endDate = $scope.obj.endDay + ' ' + et + ':59' + momentTz;

            acwDetailApiAccess.GetAcwSummeryDetails($scope.obj.resourceId, startDate, endDate, $scope.skillFilter).then(function(response){
                if(response.IsSuccess)
                {
                    if(response.Result) {
                        $scope.totalAcwSessions = response.Result.TotalAcwSessions?response.Result.TotalAcwSessions:0;
                        $scope.totalAcwTime = response.Result.TotalAcwTime?parseInt(response.Result.TotalAcwTime):0;
                        $scope.averageAcwTime = response.Result.AverageAcwTime?parseFloat(response.Result.AverageAcwTime).toFixed(2):0;

                        var durationObj = moment.duration($scope.totalAcwTime*1000);
                        if(durationObj._data.days>0){
                            $scope.timeStr = durationObj._data.days+'d '+durationObj._data.hours+'h:'+durationObj._data.minutes+'m:'+durationObj._data.seconds+'s';
                        }else{
                            $scope.timeStr = durationObj._data.hours+'h:'+durationObj._data.minutes+'m:'+durationObj._data.seconds+'s';
                        }
                        $scope.getAcwRecords();
                    }

                }
                else
                {
                    var errMsg = response.CustomMessage;

                    if(response.Exception)
                    {
                        errMsg = response.Exception.Message;
                    }
                    $scope.showAlert('ACW Details', errMsg, 'error');
                }
            }, function(err){
                loginService.isCheckResponse(err);
                var errMsg = "Error occurred while loading ACW records";
                if(err.statusText)
                {
                    errMsg = err.statusText;
                }
                $scope.showAlert('ACW Details', errMsg, 'error');
            });
        };

        $scope.getAcwRecords = function(){
            //$scope.currentPage = pageNo + 1;
            $scope.showTable = false;
            var st = moment($scope.startTime, ["h:mm A"]).format("HH:mm");
            var et = moment($scope.endTime, ["h:mm A"]).format("HH:mm");
            var momentTz = moment.parseZone(new Date()).format('Z');
            momentTz = momentTz.replace("+", "%2B");

            var startDate = $scope.obj.startDay + ' ' + st + ':00' + momentTz;
            var endDate = $scope.obj.endDay + ' ' + et + ':59' + momentTz;

            acwDetailApiAccess.GetAcwRecords($scope.obj.resourceId, $scope.pagination.currentPage, $scope.pageSize, startDate, endDate, $scope.skillFilter).then(function(response){
                if(response.IsSuccess)
                {
                    $scope.showTable = true;
                    $scope.allAcwRecords = response.Result;
                    /*$scope.acwRecords = response.Result;*/
                    var sessionIds = [];
                    $scope.obj.isTableLoading = 1;
                    if($scope.allAcwRecords && $scope.allAcwRecords.length > 0){


                        if($scope.allAcwRecords.length < $scope.pageSize){
                            $scope.showPaging = false;
                        }else{
                            $scope.showPaging = true;
                        }
                    }else{
                        $scope.obj.isTableLoading = 1;
                        $scope.showPaging = false;
                    }
                }
                else
                {
                    var errMsg = response.CustomMessage;

                    if(response.Exception)
                    {
                        errMsg = response.Exception.Message;
                    }
                    $scope.showAlert('ACW Details', errMsg, 'error');
                }
            }, function(err){
                loginService.isCheckResponse(err);
                var errMsg = "Error occurred while loading ACW records";
                if(err.statusText)
                {
                    errMsg = err.statusText;
                }
                $scope.showAlert('ACW Details', errMsg, 'error');
            });
        };


        $scope.getResourceDetails();

    };

    app.controller('acwDetailController', acwDetailController);
}());