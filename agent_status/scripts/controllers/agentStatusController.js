mainApp.controller("agentStatusController", function ($scope, $state, $filter, $stateParams, $timeout, $log,
                                                      $anchorScroll, agentStatusService, notifiSenderService) {

    $anchorScroll();
    $scope.showCallInfos = false;
    $scope.summaryText = "Table";
    $scope.summary = false;
    $scope.largeCard = false;
    $scope.smallCard = false;
    $scope.showDetails = true;
    $scope.showTableCard = function () {
        $scope.summary = true;
        $scope.largeCard = false;
        $scope.smallCard = false;
        $scope.showDetails = false;
    };
    $scope.showSmallCard = function () {
        $scope.summary = false;
        $scope.largeCard = false;
        $scope.smallCard = true;
        $scope.showDetails = false;
    };
    $scope.showLargeCard = function () {
        $scope.summary = false;
        $scope.largeCard = true;
        $scope.smallCard = false;
        $scope.showDetails = false;
    };
    $scope.showDetailsCard = function () {
        $scope.summary = false;
        $scope.largeCard = false;
        $scope.smallCard = false;
        $scope.showDetails = true;
    };

    $scope.productivity = [];
    $scope.productivity = [];
    $scope.isLoading = true;
    $scope.GetProductivity = function () {
        agentStatusService.GetProductivity().then(function (response) {
            $scope.productivity = response;
            $scope.isLoading = true;
            calculateProductivity();
        }, function (error) {
            $log.debug("productivity err");
            $scope.showAlert("Error", "Error", "ok", "Fail To Get productivity.");
            $scope.isLoading = false;
        });
    };
    $scope.GetProductivity();
    $scope.showCallDetails = false;
    var calculateProductivity = function () {
        $scope.Productivitys = [];
        $scope.showCallDetails = false;
        if ($scope.profile) {
            if ($scope.profile.length == 0) {
                angular.copy($scope.availableProfile, $scope.profile);
            }

            angular.forEach($scope.profile, function (agent) {
                try {
                    if (agent) {
                        if ($scope.agentMode.length > 0) {
                            var modeData = $filter('filter')($scope.agentMode, {Name: agent.Status.Mode});
                            if (modeData.length == 0) {
                                return;
                            }
                        }


                        var ids = $filter('filter')($scope.productivity, {ResourceId: agent.ResourceId}, true);//"ResourceId":"1"

                        if (ids.length > 0) {
                            var agentProductivity = {
                                "data": [{
                                    value: ids[0].AcwTime ? ids[0].AcwTime : 0,
                                    name: 'After work'
                                }, {
                                    value: ids[0].BreakTime ? ids[0].BreakTime : 0,
                                    name: 'Break'
                                }, {
                                    value: ((ids[0].OnCallTime ? ids[0].OnCallTime : 0)+(ids[0].OutboundCallTime ? ids[0].OutboundCallTime : 0)),//OutboundCallTime
                                    name: 'On Call'
                                }, {
                                    value: ids[0].IdleTime ? ids[0].IdleTime : 0,
                                    name: 'Idle'
                                }],
                                "ResourceId": agent.ResourceId,
                                "ResourceName": agent.ResourceName,
                                "IncomingCallCount": ids[0].IncomingCallCount ? ids[0].IncomingCallCount : 0,
                                "OutgoingCallCount": ids[0].OutgoingCallCount? ids[0].OutgoingCallCount : 0,
                                "MissCallCount": ids[0].MissCallCount ? ids[0].MissCallCount : 0,
                                "Chatid": agent.ResourceId,
                                "AcwTime": ids[0].AcwTime,
                                "BreakTime": ids[0].BreakTime,
                                "HoldTime": ids[0].HoldTime,
                                "TransferCallCount": ids[0].TransferCallCount,
                                "OnCallTime": ((ids[0].OnCallTime ? ids[0].OnCallTime : 0)+(ids[0].OutboundCallTime ? ids[0].OutboundCallTime : 0)),
                                "IdleTime": ids[0].IdleTime,
                                "StaffedTime": ids[0].StaffedTime,
                                "slotState": {},
                                "RemoveProductivity": false
                            };

                        }
                        var resonseStatus = null,
                            resonseAvailability = null;

                        if (agent.Status.Reason && agent.Status.State) {
                            resonseAvailability = agent.Status.State;
                            resonseStatus = agent.Status.Reason;
                        }

                        if (agent.ConcurrencyInfo.length > 0 &&
                            agent.ConcurrencyInfo[0].SlotInfo.length > 0) {

                            // is user state Reason




                            var reservedDate = agent.ConcurrencyInfo[0].SlotInfo[0].StateChangeTime;

                            if (resonseAvailability == "NotAvailable") {
                                agentProductivity.slotState = resonseStatus;
                                agentProductivity.other = "Break";
                                reservedDate = agent.Status.StateChangeTime;
                            } else if (agent.ConcurrencyInfo[0].IsRejectCountExceeded) {
                                agentProductivity.slotState = "Suspended";
                                agentProductivity.other = "Reject";
                            } else {
                                agentProductivity.slotState = agent.ConcurrencyInfo[0].SlotInfo[0].State;

                                if (agent.ConcurrencyInfo[0].SlotInfo[0].State == "Available") {

                                    reservedDate = agent.Status.StateChangeTime;
                                }
                            }


                            if (reservedDate == "") {
                                agentProductivity.LastReservedTime = null;
                            } else {
                                agentProductivity.LastReservedTime = moment(reservedDate).format('DD/MM/YYYY HH:mm:ss');
                                agentProductivity.slotStateTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(reservedDate))).format("HH:mm:ss");
                            }


                        }else{
                            agentProductivity.slotState = "Offline";
                            agentProductivity.other = "Offline";
                            var offlineReservedDate = agent.Status.StateChangeTime;

                            if (resonseAvailability == "NotAvailable") {
                                agentProductivity.slotState = resonseStatus;
                                agentProductivity.other = "Break";
                            }

                            agentProductivity.LastReservedTime = moment(offlineReservedDate).format('DD/MM/YYYY HH:mm:ss');
                            agentProductivity.slotStateTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(offlineReservedDate))).format("HH:mm:ss");

                        }


                        /* Set Task Info*/
                        agentProductivity.taskList = [];
                        angular.forEach(agent.ResourceAttributeInfo, function (item) {
                            try {
                                var task = {};
                                task.taskType = item.HandlingType;
                                task.percentage = item.Percentage;
                                //$filter('filter')(array, expression, comparator, anyPropertyKey)
                                //var filteredData =  $filter('filter')($scope.gridUserData.data,{ Id: userid },true);
                                var data = $filter('filter')($scope.attributesList, {AttributeId: parseInt(item.Attribute)}, true);
                                if (data.length > 0)
                                    task.skill = data[0].Attribute;
                                agentProductivity.taskList.push(task);
                            }
                            catch (ex) {
                                console.info(ex);
                            }
                        });
                        /* Set Task Info*/

                        /* Set ConcurrencyInfo */
                        var sessionIds = [];
                        angular.forEach(agent.ConcurrencyInfo, function (item) {
                            try {
                                var slotInfo = $filter('filter')(item.SlotInfo, {State: "Connected"});
                                if (slotInfo.length > 0) {
                                    var sid = slotInfo[0].HandlingRequest;
                                    sessionIds.push(sid);
                                }
                            }
                            catch (ex) {
                                console.info(ex);
                            }
                        });

                        /*Get Call info base on sid*/
                        agentProductivity.callInfos = [];
                        angular.forEach($scope.activeCalls, function (item) {
                            try {
                                var inboundCalls = $filter('filter')(item, {'Call-Direction': "inbound"});
                                angular.forEach(sessionIds, function (sid) {
                                    try {
                                        var callInfo = $filter('filter')(inboundCalls, {'Unique-ID': sid});
                                        if (callInfo.length > 0) {

                                            agentProductivity.callInfos.push(callInfo[0]);
                                            console.info(callInfo);
                                            $scope.showCallDetails = true;
                                        }
                                    } catch (ex) {
                                        console.info(ex);
                                    }
                                })
                            }
                            catch (ex) {
                                console.info(ex);
                            }
                        });

                        /* Set ConcurrencyInfo*/

                        agentProductivity.profileName = agent.ResourceName;

                        $scope.Productivitys.push(agentProductivity);

                    }

                } catch (ex) {
                    console.log(ex);
                    //$scope.isLoading = false;
                }

            });
            $scope.isLoading = false;
        }
        else {
            $scope.isLoading = false;
        }

    };


    $scope.activeCalls = [];

    $scope.GetAllActiveCalls = function () {
        agentStatusService.GetAllActiveCalls().then(function (response) {
            $scope.activeCalls = response;

        }, function (error) {
            $log.debug("getAllActiveCalls err");
            $scope.showAlert("Error", "Error", "ok", "Fail To Get Active Call List.");
        });
    };
    $scope.GetAllActiveCalls();

    $scope.attributesList = [];
    $scope.GetAllAttributes = function () {
        agentStatusService.GetAllAttributes().then(function (response) {
            $scope.attributesList = response;
            $scope.getProfileDetails();
        }, function (error) {
            $log.debug("GetAllAttributes err");
            $scope.showAlert("Error", "Error", "ok", "Fail To Get Attribute List.");
        });
    };
    $scope.GetAllAttributes();

    $scope.profile = [];
    $scope.availableProfile = [];

    $scope.getProfileDetails = function () {
        agentStatusService.GetProfileDetails().then(function (response) {

            $scope.availableProfile = response;
            if ($scope.profile.length == 0) {
                angular.copy($scope.availableProfile, $scope.profile);
            }
        });
    };


    var getAllRealTime = function () {
        $scope.getProfileDetails();
        $scope.GetAllActiveCalls();
        $scope.GetProductivity();
        getAllRealTimeTimer = $timeout(getAllRealTime, $scope.refreshTime);
    };

    // getAllRealTime();
    var getAllRealTimeTimer = $timeout(getAllRealTime, $scope.refreshTime);


    $scope.$on("$destroy", function () {
        if (getAllRealTimeTimer) {
            $timeout.cancel(getAllRealTimeTimer);
        }
    });

    $scope.refreshTime = 10000;

    $scope.showAlert = function (tittle, label, button, content) {
        new PNotify({
            title: tittle,
            text: content,
            type: 'success',
            styling: 'bootstrap3'
        });
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    //update damith
    $scope.viewScroll = function () {
        $scope.safeApply(function () {
            $scope.scrollEnabled = true;
        });

    };
    $scope.hideScroll = function () {
        $scope.safeApply(function () {
            $scope.scrollEnabled = false;
        });
    };

    //GetUserProfileList
    notifiSenderService.getUserList().then(function (response) {
        $scope.userList = response;
    }, function (error) {
        $log.debug("get user list error.....");
    });

    $scope.querySearch = function (query) {
        if (query === "*" || query === "") {
            if ($scope.availableProfile) {
                return $scope.availableProfile;
            }
            else {
                return [];
            }

        }
        else {
            if ($scope.availableProfile) {
                var filteredArr = $scope.availableProfile.filter(function (item) {
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
                return [];
            }
        }

    };

    $scope.agentMode = [];
    $scope.availableAgentMode = [{"Name": "Inbound"}, {"Name": "Outbound"}, {"Name": "Offline"}];
    angular.copy($scope.availableAgentMode, $scope.agentMode);
    $scope.agentModeQuerySearch = function (query) {
        if (query === "*" || query === "") {
            if ($scope.availableAgentMode) {
                return $scope.availableAgentMode;
            }
            else {
                return [];
            }

        }
        else {
            if ($scope.availableAgentMode) {
                var filteredArr = $scope.availableAgentMode.filter(function (item) {
                    var regEx = "^(" + query + ")";

                    if (item.Name) {
                        return item.Name.match(regEx);
                    }
                    else {
                        return false;
                    }

                });

                return filteredArr;
            }
            else {
                return [];
            }
        }

    };

    $scope.ResourceAdded = function () {
        $scope.isLoading = true;
        //getAllRealTime();
    };

    $scope.AgentModeAdded = function () {
        $scope.isLoading = true;
        //getAllRealTime();
    };

    $scope.LoadProductivity = function () {
        $scope.isLoading = true;
        $scope.GetProductivity();
    };
});


