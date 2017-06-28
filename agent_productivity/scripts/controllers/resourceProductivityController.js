var app = angular.module("veeryConsoleApp");

app.controller("resourceProductivityController", function ($scope, $filter, $location, $log, $anchorScroll, resourceProductivityService) {

    $anchorScroll();
    $scope.reloadPage = function () {
        $scope.OnlineAgents = [];
        $scope.productivity = [];
        $scope.GetOnlineAgents();
    };
    $scope.isLoading = true;
    $scope.productivity = [];
    $scope.getProductivity = function () {
        if ($scope.OnlineAgents.length == 0) {
            angular.copy($scope.AvailableAgents, $scope.OnlineAgents);
        }
        resourceProductivityService.GetProductivity().then(function (response) {

            $log.debug("GetCallServers: response" + response);
            $scope.productivity = response;
            calculateProductivity();
        }, function (error) {
            $log.debug("GetCallServers err");
            $scope.showError("Error", "Error", "ok", "There is an error ");
            $scope.isLoading = false;
        });

    };

    $scope.AvailableAgents = [];
    $scope.OnlineAgents = [];
    $scope.GetOnlineAgents = function () {
        resourceProductivityService.GetOnlineAgents().then(function (response) {
            $scope.AvailableAgents = response;
            angular.copy(response, $scope.OnlineAgents);
            $scope.getProductivity();
        }, function (error) {
            $log.debug("GetOnlineAgents err");
            $scope.showError("Error", "Error", "ok", "There is an error ");
        });

    };
    $scope.GetOnlineAgents();


    $scope.querySearch = function (query) {
        if (query === "*" || query === "") {
            if ($scope.AvailableAgents) {
                return $scope.AvailableAgents;
            }
            else {
                return [];
            }

        }
        else {
            if ($scope.AvailableAgents) {
                var filteredArr = $scope.AvailableAgents.filter(function (item) {
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

    $scope.AgentAdded = function () {
        $scope.getProductivity();
    };


    $scope.Productivitys = [];

    var calculateProductivity = function () {
        if ($scope.OnlineAgents) {
            angular.forEach($scope.OnlineAgents, function (agent) {
                try {
                    if (agent) {
                        var ids = $filter('filter')($scope.productivity, {ResourceId: agent.ResourceId});//"ResourceId":"1"
                        if (ids[0]) {

                            var agentProductivity = {
                                "data": [{
                                    value: ids[0].AcwTime ? ids[0].AcwTime : 0,
                                    name: 'After work'
                                }, {
                                    value: ids[0].BreakTime ? ids[0].BreakTime : 0,
                                    name: 'Break'
                                }, {
                                    value: ids[0].OnCallTime ? ids[0].OnCallTime : 0,
                                    name: 'On Call'
                                }, {
                                    value: ids[0].OutboundCallTime ? ids[0].OutboundCallTime : 0,
                                    name: 'Out Call Time'
                                }, {
                                    value: ids[0].IdleTime ? ids[0].IdleTime : 0,
                                    name: 'Idle'
                                }],
                                "ResourceId": agent.ResourceId,
                                "ResourceName": agent.ResourceName,
                                "IncomingCallCount": ids[0].IncomingCallCount ? ids[0].IncomingCallCount : 0,
                                "MissCallCount": ids[0].MissCallCount ? ids[0].MissCallCount : 0,
                                "Chatid": agent.ResourceId
                            };

                            $scope.Productivitys.push(agentProductivity);
                        }
                    }
                    $scope.isLoading = false;
                } catch (ex) {
                    console.log(ex);
                    $scope.isLoading = false;
                }
            });

            $scope.echartDonutSetOption();
        }
    };

    /* $scope.labels = ["After work", "Break", "On Call", "Idle"];
     $scope.data = [300, 500, 100, 100];*/
    $scope.showError = function (tittle, content) {

        new PNotify({
            title: tittle,
            text: content,
            type: 'error',
            styling: 'bootstrap3'
        });
    };

    $scope.showAlert = function (tittle, label, button, content) {

        new PNotify({
            title: tittle,
            text: content,
            type: 'success',
            styling: 'bootstrap3'
        });
    };


    var theme = {
        color: [
            '#db4114', '#f8b01d', '#2ba89c', '#114858',
            '#9B59B6', '#8abb6f', '#759c6a', '#bfd3b7'
        ],
        title: {
            itemGap: 8,
            textStyle: {
                color: '#408829',
                fontFamily: 'Roboto',
                fontWeight: 300
            }
        },

        dataRange: {
            color: ['#1f610a', '#97b58d']
        },

        toolbox: {
            color: ['#408829', '#408829', '#408829', '#408829']
        },

        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: '#408829',
                    type: 'dashed'
                },
                crossStyle: {
                    color: '#408829'
                },
                shadowStyle: {
                    color: 'rgba(200,200,200,0.3)'
                }
            }
        },

        dataZoom: {
            dataBackgroundColor: '#eee',
            fillerColor: 'rgba(64,136,41,0.2)',
            handleColor: '#408829'
        },
        grid: {
            borderWidth: 0
        },

        categoryAxis: {
            axisLine: {
                lineStyle: {
                    color: '#408829'
                }
            },
            splitLine: {
                lineStyle: {
                    color: ['#eee']
                }
            }
        },

        valueAxis: {
            axisLine: {
                lineStyle: {
                    color: '#408829'
                }
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
                }
            },
            splitLine: {
                lineStyle: {
                    color: ['#eee']
                }
            }
        },
        timeline: {
            lineStyle: {
                color: '#408829'
            },
            controlStyle: {
                normal: {color: '#408829'},
                emphasis: {color: '#408829'}
            }
        },

        k: {
            itemStyle: {
                normal: {
                    color: '#68a54a',
                    color0: '#a9cba2',
                    lineStyle: {
                        width: 1,
                        color: '#408829',
                        color0: '#86b379'
                    }
                }
            }
        },
        map: {
            itemStyle: {
                normal: {
                    areaStyle: {
                        color: '#ddd'
                    },
                    label: {
                        textStyle: {
                            color: '#c12e34'
                        }
                    }
                },
                emphasis: {
                    areaStyle: {
                        color: '#99d2dd'
                    },
                    label: {
                        textStyle: {
                            color: '#c12e34'
                        }
                    }
                }
            }
        },
        force: {
            itemStyle: {
                normal: {
                    linkStyle: {
                        strokeColor: '#408829'
                    }
                }
            }
        },
        chord: {
            padding: 4,
            itemStyle: {
                normal: {
                    lineStyle: {
                        width: 1,
                        color: 'rgba(128, 128, 128, 0.5)'
                    },
                    chordStyle: {
                        lineStyle: {
                            width: 1,
                            color: 'rgba(128, 128, 128, 0.5)'
                        }
                    }
                },
                emphasis: {
                    lineStyle: {
                        width: 1,
                        color: 'rgba(128, 128, 128, 0.5)'
                    },
                    chordStyle: {
                        lineStyle: {
                            width: 1,
                            color: 'rgba(128, 128, 128, 0.5)'
                        }
                    }
                }
            }
        },
        gauge: {
            startAngle: 225,
            endAngle: -45,
            axisLine: {
                show: true,
                lineStyle: {
                    color: [[0.2, '#86b379'], [0.8, '#68a54a'], [1, '#408829']],
                    width: 8
                }
            },
            axisTick: {
                splitNumber: 10,
                length: 12,
                lineStyle: {
                    color: 'auto'
                }
            },
            axisLabel: {
                textStyle: {
                    color: 'auto'
                }
            },
            splitLine: {
                length: 18,
                lineStyle: {
                    color: 'auto'
                }
            },
            pointer: {
                length: '90%',
                color: 'auto'
            },
            title: {
                textStyle: {
                    color: '#333'
                }
            },
            detail: {
                textStyle: {
                    color: 'auto'
                }
            }
        },
        textStyle: {
            fontFamily: 'Arial, Verdana, sans-serif'
        }
    };

    //-----------------------------------------------

    function secondsToTime(secs) {
        var hours = Math.floor(secs / (60 * 60));

        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);

        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);

        return hours + ":" + minutes + ":" + seconds;
    }

    var myObject = {};
    $scope.echartDonutSetOption = function () {
        angular.forEach($scope.Productivitys, function (productivity) {
            myObject[productivity.Chatid] = echarts.init(document.getElementById(productivity.ResourceId), theme);
            myObject[productivity.Chatid].setOption({
                title: {
                    show: true,
                    text: productivity.ResourceName,
                    textStyle: {
                        fontSize: 18,
                        fontWeight: 'bolder',
                        color: '#333',
                        fontFamily: 'Ubuntu-Regular'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    //formatter: "{a} <br/>{b} : {c} ({d}%)",
                    formatter: function (params, ticket, callback) {
                        var res = params.seriesName + ' <br/>' + params.name + ' ' + secondsToTime(params.value) + ' ' + params.percent + '%';
                        setTimeout(function () {
                            callback(ticket, res);
                        }, 100);
                        return 'loading';
                    }
                },
                calculable: true,
                legend: {
                    x: 'center',
                    y: 'bottom',
                    data: ['After work', 'Break', 'On Call','Out Call Time', 'Idle']
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {show: true},
                        //dataView : {show: true, readOnly: false},
                        magicType: {
                            show: true,
                            type: ['pie', 'funnel'],
                            option: {
                                funnel: {
                                    x: '10%',
                                    width: '50%',
                                    funnelAlign: 'center',
                                    max: 1548
                                }
                            }
                        },
                        restore: {
                            show: false,
                            title: "Restore"
                        },
                        saveAsImage: {
                            show: true,
                            title: "Save As Image"
                        }
                    }
                },
                series: [{
                    name: 'Productivity',
                    type: 'pie',
                    radius: ['35%', '55%'],
                    itemStyle: {
                        normal: {
                            label: {
                                show: true
                            },
                            labelLine: {
                                show: true
                            }
                        },
                        emphasis: {
                            label: {
                                show: true,
                                position: 'center',
                                textStyle: {
                                    fontSize: '14',
                                    fontWeight: 'normal'
                                }
                            }
                        }
                    },
                    data: productivity.data
                }]
            });

        });


    };

});

app.controller("resourceEditController", function ($scope, $routeParams, $location, $log, $filter, clusterService) {


});
