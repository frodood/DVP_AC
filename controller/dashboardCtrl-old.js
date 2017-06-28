/**
 * Created by Damith on 5/29/2016.
 */

mainApp.controller('dashboardCtrl', function ($scope, $state, $timeout,
                                              loginService,
                                              dashboardService, moment, userImageList,$interval,$anchorScroll) {

    $anchorScroll();
    //#services call handler
    $scope.total = {
        callsInb: 0,
        callsOutb: 0,
        queued: 0,
        queueAnswered: 0,
        queueDropped: 0,
        waiting: 0,
        briged: 0,
        onGoingInb: 0,
        onGoingOutb: 0
    };

    //#profile object
    $scope.AvailableTask = [];
    $scope.ResourceTask = {CALL: [], CHAT: [], SMS: [], SOCIAL: [], TICKET: [], OFFLINE: []};
    $scope.profile = [];


    $scope.LoadCompanyTasks = function () {
        dashboardService.getCompanyTasks().then(function (response) {
            if (response.IsSuccess) {
                if (response.Result && response.Result.length > 0) {
                    for (var i = 0; i < response.Result.length; i++) {
                        var TaskType = response.Result[i].ResTaskInfo.TaskType;
                        $scope.AvailableTask.push(TaskType);
                    }
                }
            }
            else {
                $scope.AvailableTask = ["CALL", "CHAT", "SMS", "SOCIAL", "TICKET"];
            }
        }, function (err) {
            loginService.isCheckResponse(err);
            $scope.AvailableTask = ["CALL", "CHAT", "SMS", "SOCIAL", "TICKET"];
        });
    };
    $scope.LoadCompanyTasks();

    $scope.chartymax = {
        calls: 1,
        briged: 1,
        queued: 1,
        channels: 1

    };


    var ServerHandler = (function () {
        $scope.data = [];
        $scope.dataSetAll = [{
            data: [],
            lines: {
                fill: true,
                lineWidth: 2
            }
        }];
        $scope.dataSetQueued = [{
            data: [],
            lines: {
                fill: false,
                tension: 0.5,
                lineWidth: 2
            }
        }];
        $scope.dataSetBriged = [{
            data: [], lines: {
                fill: false,
                lineWidth: 2
            }
        }];
        $scope.dataSetChannels = [{
            data: [], lines: {
                fill: false,
                lineWidth: 2
            }
        }];
        return {
            getDataAll: function () {
                dashboardService.GetAll().then(function (response) {
                    if (response && response.length > 0) {
                        response.pop();
                        var max = 0;
                        $scope.dataSetAll[0].data = response.map(function (c, index) {
                            var item = [];
                            item[0] = c[1];
                            item[1] = c[0];


                            if (c[0] > max) {

                                max = c[0];
                            }

                            return item;
                        });

                        if (max == 0) {
                            max = 1;
                        }

                        if ($scope.chartymax.calls != Math.ceil(max)) {

                            $scope.chartymax.calls = Math.ceil(max);
                            $scope.myChartOptions.yaxis.max = $scope.chartymax.calls;
                        }
                    }
                });
            }, getAllQueued: function () {
                dashboardService.GetAllQueued().then(function (response) {
                    if (response && response.length > 0) {
                        response.pop();
                        var max = 0;
                        $scope.dataSetQueued[0].data = response.map(function (c, index) {
                            var item = [];
                            item[0] = c[1];
                            item[1] = c[0];
                            if (c[0] > max) {

                                max = c[0];
                            }


                            return item;
                        });


                        if (max == 0) {
                            max = 1;
                        }

                        if ($scope.chartymax.queued != Math.ceil(max)) {

                            $scope.chartymax.queued = Math.ceil(max);
                            $scope.myChartOptions2.yaxis.max = $scope.chartymax.queued;
                        }
                    }
                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            }, getAllBriged: function () {
                dashboardService.GetAllBriged().then(function (response) {
                    if (response && response.length > 0) {
                        response.pop();

                        var max = 0;
                        $scope.dataSetBriged[0].data = response.map(function (c, index) {
                            var item = [];
                            item[0] = c[1];
                            item[1] = c[0];

                            if (c[0] > max) {

                                max = c[0];
                            }

                            return item;
                        });


                        if (max == 0) {
                            max = 1;
                        }

                        if ($scope.chartymax.briged != Math.ceil(max)) {

                            $scope.chartymax.briged = Math.ceil(max);
                            $scope.myChartOptions3.yaxis.max = $scope.chartymax.briged;
                        }
                    }
                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            }, getAllChannels: function () {
                /*dashboardService.GetAllChannels().then(function (response) {
                 if(response && response.length >0) {
                 response.pop();
                 var max = 0;
                 $scope.dataSetChannels[0].data = response.map(function (c, index) {
                 var item = [];
                 item[0] = c[1];
                 item[1] = c[0];

                 if (c[0] > max) {
                 max = c[0];
                 }
                 return item;
                 });

                 if (max == 0) {
                 max = 1;
                 }

                 if ($scope.chartymax.channels != Math.ceil(max)) {
                 $scope.chartymax.channels = Math.ceil(max);
                 $scope.myChartOptions4.yaxis.max = $scope.chartymax.channels;
                 }
                 }
                 });*/
            },
            getTotalQueueHit: function () {
                dashboardService.GetTotalQueueHit().then(function (response) {
                    if (response && response.length > 0) {
                        response.pop();
                        var max = 0;
                        $scope.dataSetChannels[0].data = response.map(function (c, index) {
                            var item = [];
                            item[0] = c[1];
                            item[1] = c[0];

                            if (c[0] > max) {
                                max = c[0];
                            }
                            return item;
                        });

                        if (max == 0) {
                            max = 1;
                        }

                        if ($scope.chartymax.channels != Math.ceil(max)) {
                            $scope.chartymax.channels = Math.ceil(max);
                            $scope.myChartOptions4.yaxis.max = $scope.chartymax.channels;
                        }
                    }
                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            },
            getTotalCall: function () {
                dashboardService.GetTotalCalls('inbound', null).then(function (responseInb) {

                    if (responseInb && responseInb > 0) {
                        $scope.total.callsInb = responseInb;
                    }
                    else {
                        $scope.total.callsInb = 0;
                    }

                }, function (err) {
                    loginService.isCheckResponse(err);
                });

                dashboardService.GetTotalCalls('outbound', null).then(function (responseOutb) {

                    if (responseOutb && responseOutb > 0) {
                        $scope.total.callsOutb = responseOutb;
                    }
                    else {
                        $scope.total.callsOutb = 0;
                    }

                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            },
            getTotalQueued: function () {
                dashboardService.GetTotalQueued().then(function (response) {
                    $scope.total.queued = response;
                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            },
            getTotalQueueAnswered: function () {
                dashboardService.GetTotalQueueAnswered().then(function (response) {
                    $scope.total.queueAnswered = response;
                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            },
            getCurrentWaiting: function () {
                dashboardService.GetCurrentWaiting().then(function (response) {
                    $scope.total.waiting = response;
                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            },
            getTotalQueueDropped: function () {
                dashboardService.GetTotalQueueDropped().then(function (response) {
                    $scope.total.queueDropped = response;
                });
            },
            getTotalBriged: function () {
                dashboardService.GetTotalBriged().then(function (response) {
                    $scope.total.briged = response;
                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            },
            getTotalOnGoing: function () {
                dashboardService.GetTotalOnGoing('inbound').then(function (response) {
                    $scope.total.onGoingInb = response;
                }, function (err) {
                    loginService.isCheckResponse(err);
                });

                dashboardService.GetTotalOnGoing('outbound').then(function (response) {
                    $scope.total.onGoingOutb = response;
                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            },
            getProfileDetails: function () {
                dashboardService.GetProfileDetails().then(function (response) {
                    //$scope.profile = [];
                    $scope.ResourceTask = {CALL: [], CHAT: [], SMS: [], SOCIAL: [], TICKET: [], OFFLINE: []};
                    if (response.length > 0) {
                        for (var i = 0; i < response.length; i++) {


                            var profile = {
                                name: '',
                                avatar: '',
                                slotInfo: []
                            };
                            profile.name = response[i].ResourceName;

                            //get current user profile image
                            userImageList.getAvatarByUserName(profile.name, function (res) {
                                profile.avatar = res;
                            });

                            if (response[i].Status.Reason && response[i].Status.State) {
                                resonseAvailability = response[i].Status.State;
                                resonseStatus = response[i].Status.Reason;
                                resourceMode = response[i].Status.Mode;
                            }


                            if (response[i].ConcurrencyInfo && response[i].ConcurrencyInfo.length > 0) {

                                for (var j = 0; j < response[i].ConcurrencyInfo.length; j++) {
                                    var resourceTask = response[i].ConcurrencyInfo[j].HandlingType;


                                    if (response[i].ConcurrencyInfo[j].SlotInfo.length > 0) {
                                        for (var k = 0; k < response[i].ConcurrencyInfo[j].SlotInfo.length; k++) {
                                            var resonseStatus = null, resonseAvailability = null;

                                            if (response[i].ConcurrencyInfo[j].IsRejectCountExceeded) {
                                                resonseAvailability = "NotAvailable";
                                                resonseStatus = "Suspended";
                                            }


                                            var reservedDate = response[i].ConcurrencyInfo[j].SlotInfo[k].StateChangeTime;

                                            var slotInfo = {
                                                slotState: null,
                                                LastReservedTime: 0,
                                                other: null,
                                                slotMode: resourceMode
                                            };

                                            if (resonseAvailability == "NotAvailable" && (resonseStatus == "Reject Count Exceeded" || resonseStatus == "Suspended")) {
                                                slotInfo.slotState = resonseStatus;
                                                slotInfo.other = "Reject";
                                            } else if (resonseAvailability == "NotAvailable" && resonseStatus.toLowerCase().indexOf("break") > -1) {
                                                slotInfo.slotState = resonseStatus;
                                                slotInfo.other = "Break";
                                                reservedDate = response[i].Status.StateChangeTime;
                                            } else {
                                                slotInfo.slotState = response[i].ConcurrencyInfo[j].SlotInfo[k].State;

                                                if (response[i].ConcurrencyInfo[j].SlotInfo[k].State == "Available") {

                                                    var slotStateTime = moment(reservedDate);
                                                    var resourceStateTime = moment(response[i].Status.StateChangeTime);
                                                    if (slotStateTime.isBefore(resourceStateTime)) {
                                                        reservedDate = response[i].Status.StateChangeTime;
                                                    }
                                                }
                                            }


                                            if (reservedDate == "") {
                                                slotInfo.LastReservedTime = null;
                                                //slotInfo.unixTime = 0;
                                            } else {
                                                slotInfo.LastReservedTime = moment(reservedDate).format("h:mm a");
                                                //slotInfo.unixTime = moment(reservedDate).unix();
                                            }

                                            profile.slotInfo.push(slotInfo);
                                            $scope.ResourceTask[resourceTask].push(profile);
                                            //$scope.profile.push(profile);
                                        }
                                    }
                                }

                                // is user state Reason

                            } else {

                                reservedDate = response[i].Status.StateChangeTime;
                                var slotInfoOffline = {
                                    slotState: "Other",
                                    LastReservedTime: moment(reservedDate).format("h:mm a"),
                                    other: "Offline",
                                    slotMode: resourceMode
                                };

                                if (resonseAvailability == "NotAvailable" && resonseStatus.toLowerCase().indexOf("break") > -1) {


                                    slotInfoOffline.slotState = resonseStatus;
                                    slotInfoOffline.other = "Break";

                                }

                                profile.slotInfo.push(slotInfoOffline);
                                $scope.ResourceTask['OFFLINE'].push(profile);
                            }
                        }
                    }
                }, function (err) {
                    loginService.isCheckResponse(err);
                });
            },
            callAllServices: function () {
                ServerHandler.getDataAll();
                ServerHandler.getAllQueued();
                ServerHandler.getAllBriged();
                ServerHandler.getTotalQueueHit();//ServerHandler.getAllChannels();

            },
            getAllNumTotal: function () {
                ServerHandler.getTotalCall();
                ServerHandler.getTotalQueueAnswered();
                ServerHandler.getTotalQueued();
                ServerHandler.getTotalQueueDropped();
            },
            updateRelaTimeFuntion: function () {
                ServerHandler.getTotalOnGoing();
                ServerHandler.getCurrentWaiting();
            },
            getProfiles: function () {
                ServerHandler.getProfileDetails();
            }
        }
    })();
    ServerHandler.callAllServices();
    ServerHandler.getAllNumTotal();
    ServerHandler.updateRelaTimeFuntion();
    ServerHandler.getProfiles();


    //loop request
    var t = $interval(function updateRandom() {
        ServerHandler.callAllServices();
    }, 30000);
    var tt = $interval(function updateRandom() {
        ServerHandler.getAllNumTotal();
    }, 60000);
    var t = $interval(function updateRandom() {
        ServerHandler.updateRelaTimeFuntion();
        ServerHandler.getProfiles();
    }, 1000);


    var countAllCallServices = function () {
        ServerHandler.callAllServices();
        countAllCallServicesTimer = $timeout(countAllCallServices, 30000);
    };

    var getAllNumTotal = function () {
        ServerHandler.getAllNumTotal();
        getAllNumTotalTimer = $timeout(getAllNumTotal, 60000);
    };

    var getAllRealTime = function () {
        ServerHandler.updateRelaTimeFuntion();
        ServerHandler.getProfiles();
        getAllRealTimeTimer = $timeout(getAllRealTime, 1000);
    };


    ServerHandler.callAllServices();
    ServerHandler.getAllNumTotal();
    ServerHandler.updateRelaTimeFuntion();


    var countAllCallServicesTimer = $timeout(countAllCallServices, 30000);
    var getAllNumTotalTimer = $timeout(getAllNumTotal, 60000);
    var getAllRealTimeTimer = $timeout(getAllRealTime, 1000);


    $scope.$on("$destroy", function () {
        if (countAllCallServicesTimer) {
            $timeout.cancel(countAllCallServicesTimer);
        }

        if (getAllNumTotalTimer) {
            $timeout.cancel(getAllNumTotalTimer);
        }


        if (getAllRealTimeTimer) {
            $timeout.cancel(getAllRealTimeTimer);
        }


    });


    $scope.myChartOptions = {
        grid: {borderColor: '#fff'},
        series: {shadowSize: 0, color: "#db4114"},
        color: {color: '#5566ff'},
        legend: {
            container: '#legend',
            show: true
        },
        yaxis: {
            min: 0,
            max: $scope.chartymax.calls
        },
        xaxis: {
            tickFormatter: function (val, axis) {
                return moment.unix(val).minute() + ":" + moment.unix(val).second();
            }
        }
    };

    $scope.myChartOptions2 = {
        grid: {
            borderWidth: 1,
            borderColor: '#fff',
            show: true
        },
        series: {shadowSize: 0, color: "#63a5a2"},
        color: {color: '#63a5a2'},
        legend: {
            container: '#legend',
            show: true
        },
        yaxis: {
            min: 0,
            max: $scope.chartymax.queued,
        }, xaxis: {
            tickFormatter: function (val, axis) {
                return moment.unix(val).minute() + ":" + moment.unix(val).second();
            }
        },
    };

    $scope.myChartOptions3 = {
        grid: {
            borderColor: '#fff',
            show: true
        },
        series: {shadowSize: 0, color: "#114858"},
        color: {color: '#63a5a2'},
        legend: {
            container: '#legend',
            show: true
        },
        yaxis: {
            min: 0,
            max: $scope.chartymax.briged
        }, xaxis: {
            tickFormatter: function (val, axis) {
                return moment.unix(val).minute() + ":" + moment.unix(val).second();
            }
        }
    };

    $scope.myChartOptions4 = {
        grid: {
            borderColor: '#fff',
            show: true
        },
        series: {shadowSize: 0, color: "#f8b01d"},
        color: {color: '#63a5a2'},
        legend: {
            container: '#legend',
            show: true
        },
        yaxis: {
            min: 0,
            max: $scope.chartymax.channels

        }, xaxis: {
            tickFormatter: function (val, axis) {
                return moment.unix(val).minute() + ":" + moment.unix(val).second();
            }
        }
    };
    //chart js


});
