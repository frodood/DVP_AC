/**
 * Created by dinusha on 9/6/2016.
 */
(function () {
    var app = angular.module("veeryConsoleApp");

    var agentStatusListCtrl = function ($scope, $filter, $q, cdrApiHandler, resourceService, companyConfigBackendService, loginService,$anchorScroll) {

        $anchorScroll();
        $scope.showAlert = function (tittle, type, content) {

            new PNotify({
                title: tittle,
                text: content,
                type: type,
                styling: 'bootstrap3'
            });
        };

        $scope.moment = moment;


        $scope.agentStatuses = [
            {DisplayName: 'Register', Status: 'Register'},
            {DisplayName: 'Un-Register', Status: 'UnRegister'},
            {DisplayName: 'Inbound', Status: 'Inbound'},
            {DisplayName: 'Outbound', Status: 'Outbound'}
            /*{DisplayName: 'Training Break', Status: 'TrainingBreak'},
             {DisplayName: 'Meal Break', Status: 'MealBreak'},
             {DisplayName: 'Tea Break', Status: 'TeaBreak'},
             {DisplayName: 'Official Break', Status: 'OfficialBreak'},
             {DisplayName: 'AUX Break', Status: 'AUXBreak'},
             {DisplayName: 'Process Related Break', Status: 'ProcessRelatedBreak'},
             {DisplayName: 'Meeting Break', Status: 'MeetingBreak'}*/
        ];



        $scope.getBreakTypes = function () {
            companyConfigBackendService.getAllActiveBreakTypes().then(function (response) {
                if(response.IsSuccess)
                {
                    response.Result.forEach(function(bType){
                        $scope.agentStatuses.push(
                            {
                                DisplayName: bType.BreakType,
                                Status: bType.BreakType
                            }
                        );
                    });
                }
                else
                {
                    var errMsg = response.CustomMessage;

                    if(response.Exception)
                    {
                        errMsg = response.Exception.Message;
                    }
                    $scope.showAlert('Agent List', errMsg, 'error');
                }
            }, function(err){
                var errMsg = "Error occurred while receiving Break Types";
                if(err.statusText)
                {
                    errMsg = err.statusText;
                }
                $scope.showAlert('Agent List', errMsg, 'error');
            });
        };

        $scope.getBreakTypes();



        $scope.obj = {
            startDay: moment().format("YYYY-MM-DD"),
            endDay: moment().format("YYYY-MM-DD")
        };

        $scope.startTime = '12:00 AM';
        $scope.endTime = '12:00 AM';

        $scope.timeEnabled = 'Date Only';
        $scope.timeEnabledStatus = false;

        $scope.changeTimeAvailability = function () {
            if ($scope.timeEnabled === 'Date Only') {
                $scope.timeEnabled = 'Date & Time';
                $scope.timeEnabledStatus = true;
            }
            else {
                $scope.timeEnabled = 'Date Only';
                $scope.timeEnabledStatus = false;
            }
        };


        var isEmpty = function (map) {
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        };

        var emptyArr = [];

        $scope.querySearch = function (query) {
            if (query === "*" || query === "") {
                if ($scope.resList) {
                    return $scope.resList;
                }
                else {
                    return emptyArr;
                }

            }
            else {
                if ($scope.resList) {
                    var filteredArr = $scope.resList.filter(function (item) {
                        var regEx = "^(" + query + ")";

                        if (item.ResourceName) {
                            return item.ResourceName.match(regEx);
                        }
                        else {
                            return false;
                        }

                    });

                    return filteredArr;
                }
                else {
                    return emptyArr;
                }
            }

        };

        $scope.querySearchStatus = function (query) {
            if (query === "*" || query === "") {
                if ($scope.agentStatuses) {
                    return $scope.agentStatuses;
                }
                else {
                    return emptyArr;
                }

            }
            else {
                if ($scope.agentStatuses) {
                    var filteredArr = $scope.agentStatuses.filter(function (item) {
                        var regEx = "^(" + query + ")";

                        if (item.Status) {
                            return item.Status.match(regEx);
                        }
                        else {
                            return false;
                        }

                    });

                    return filteredArr;
                }
                else {
                    return emptyArr;
                }
            }

        };

        $scope.loadAgentList = function () {
            resourceService.getResourcesWithoutPaging().then(function (resList) {
                $scope.resList = resList;

            }).catch(function (err) {
                loginService.isCheckResponse(err);
                $scope.showAlert('Agent List', 'error', 'Failed to bind agent auto complete list');

            })
        };

        $scope.loadAgentList();


        $scope.getAgentStatusList = function () {
            var st = moment($scope.startTime, ["h:mm A"]).format("HH:mm");
            var et = moment($scope.endTime, ["h:mm A"]).format("HH:mm");
            $scope.obj.isTableLoading = 0;
            var momentTz = moment.parseZone(new Date()).format('Z');
            momentTz = momentTz.replace("+", "%2B");

            var startDate = $scope.obj.startDay + ' ' + st + ':00' + momentTz;
            var endDate = $scope.obj.endDay + ' ' + et + ':59' + momentTz;

            if (!$scope.timeEnabledStatus) {
                startDate = $scope.obj.startDay + ' 00:00:00' + momentTz;
                endDate = $scope.obj.endDay + ' 23:59:59' + momentTz;
            }

            try {
                cdrApiHandler.getAgentStatusList(startDate, endDate, $scope.statusFilter, $scope.agentFilter).then(function (agentListResp) {
                    $scope.agentStatusList = {};
                    if (agentListResp && agentListResp.Result) {
                        for (var resource in agentListResp.Result) {
                            if (agentListResp.Result[resource] && agentListResp.Result[resource].length > 0 && agentListResp.Result[resource][0].ResResource && agentListResp.Result[resource][0].ResResource.ResourceName) {
                                var caption = agentListResp.Result[resource][0].ResResource.ResourceName;
                                $scope.agentStatusList[caption] = agentListResp.Result[resource];
                            }

                        }

                    }

                    $scope.obj.isTableLoading = 1;

                }).catch(function (err) {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading agent status events');
                    $scope.obj.isTableLoading = 1;
                });


            }
            catch (ex) {
                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading agent status events');
                $scope.obj.isTableLoading = 1;
            }

        };

        $scope.getAgentStatusListCSV = function () {
            var st = moment($scope.startTime, ["h:mm A"]).format("HH:mm");
            var et = moment($scope.endTime, ["h:mm A"]).format("HH:mm");
            var momentTz = moment.parseZone(new Date()).format('Z');
            momentTz = momentTz.replace("+", "%2B");

            var startDate = $scope.obj.startDay + ' ' + st + ':00' + momentTz;
            var endDate = $scope.obj.endDay + ' ' + et + ':59' + momentTz;

            if (!$scope.timeEnabledStatus) {
                startDate = $scope.obj.startDay + ' 00:00:00' + momentTz;
                endDate = $scope.obj.endDay + ' 23:59:59' + momentTz;
            }

            $scope.DownloadFileName = 'AGENT_STATUS_LIST' + $scope.obj.startDay + '_' + $scope.obj.endDay;
            var deferred = $q.defer();
            var agentStatusList = [];

            try {
                cdrApiHandler.getAgentStatusList(startDate, endDate, $scope.statusFilter, $scope.agentFilter).then(function (agentListResp) {
                    if (agentListResp && agentListResp.Result) {
                        for (var resource in agentListResp.Result) {
                            if (agentListResp.Result[resource] && agentListResp.Result[resource].length > 0 && agentListResp.Result[resource][0].ResResource && agentListResp.Result[resource][0].ResResource.ResourceName) {
                                var caption = agentListResp.Result[resource][0].ResResource.ResourceName;
                                agentListResp.Result[resource].forEach(function (evtItem) {
                                    evtItem.Agent = caption;
                                    evtItem.Date = moment(evtItem.createdAt).local().format("YYYY-MM-DD HH:mm:ss");
                                    agentStatusList.push(evtItem);
                                });
                            }

                        }

                    }

                    deferred.resolve(agentStatusList);

                }).catch(function (err) {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading agent status events');
                    deferred.reject(agentStatusList);
                });


            }
            catch (ex) {
                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading agent status events');
                deferred.reject(agentStatusList);
            }

            return deferred.promise;

        };


    };
    app.controller("agentStatusListCtrl", agentStatusListCtrl);

}());


