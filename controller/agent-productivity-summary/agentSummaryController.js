/**
 * Created by Pawan on 6/15/2016.
 */
/**
 * Created by Pawan on 6/15/2016.
 */

mainApp.controller("agentSummaryController", function ($scope,$filter,$state, $q, agentSummaryBackendService,loginService,$anchorScroll) {

    $anchorScroll();
    $scope.startDate = moment().format("YYYY-MM-DD");
    $scope.endDate = moment().format("YYYY-MM-DD");
    $scope.dateValid = true;
    $scope.agentSummaryList = [];
    $scope.Agents=[];

    $scope.dtOptions = { paging: false, searching: false, info: false, order: [2, 'asc'] };


    $scope.onDateChange = function()
    {
        if(moment($scope.startDate, "YYYY-MM-DD").isValid() && moment($scope.endDate, "YYYY-MM-DD").isValid())
        {
            $scope.dateValid = true;
        }
        else
        {
            $scope.dateValid = false;
        }
    };

    $scope.getAgentSummary = function () {
        $scope.agentSummaryList=[];
        agentSummaryBackendService.getAgentSummary($scope.startDate,$scope.endDate).then(function (response) {

            if(!response.data.IsSuccess)
            {
                console.log("Queue Summary loading failed ",response.data.Exception);
            }
            else
            {
                $scope.isTableLoading=1;
                var summaryData=response.data.Result
                for(var i=0;i<summaryData.length;i++)
                {
                    // main objects

                    for(var j=0;j<summaryData[i].Summary.length;j++)
                    {
                        summaryData[i].Summary[j].IdleTime=TimeFromatter(summaryData[i].Summary[j].IdleTime,"HH:mm:ss");
                        summaryData[i].Summary[j].AfterWorkTime=TimeFromatter(summaryData[i].Summary[j].AfterWorkTime,"HH:mm:ss");
                        summaryData[i].Summary[j].AverageHandlingTime=TimeFromatter(summaryData[i].Summary[j].AverageHandlingTime,"HH:mm:ss");
                        summaryData[i].Summary[j].StaffTime=TimeFromatter(summaryData[i].Summary[j].StaffTime,"HH:mm:ss");
                        summaryData[i].Summary[j].TalkTime=TimeFromatter(summaryData[i].Summary[j].TalkTime,"HH:mm:ss");
                        summaryData[i].Summary[j].TalkTimeOutbound=TimeFromatter(summaryData[i].Summary[j].TalkTimeOutbound,"HH:mm:ss");
                        summaryData[i].Summary[j].BreakTime=TimeFromatter(summaryData[i].Summary[j].BreakTime,"HH:mm:ss");

                        $scope.agentSummaryList.push(summaryData[i].Summary[j]);
                    }
                }
                $scope.AgentDetailsAssignToSummery();
                console.log($scope.agentSummaryList);
            }

        }, function (error) {
            loginService.isCheckResponse(error);
            console.log("Error in Queue Summary loading ",error);
        });
    };

    $scope.getAgentSummaryCSV = function () {
        $scope.DownloadFileName = 'AGENT_PRODUCTIVITY_SUMMARY_' + $scope.startDate + '_' + $scope.endDate;
        var deferred = $q.defer();
        var agentSummaryList=[];
        agentSummaryBackendService.getAgentSummary($scope.startDate,$scope.endDate).then(function (response) {

            if(!response.data.IsSuccess)
            {
                console.log("Queue Summary loading failed ",response.data.Exception);
                deferred.reject(agentSummaryList);
            }
            else
            {
                $scope.isTableLoading=1;
                var summaryData=response.data.Result
                for(var i=0;i<summaryData.length;i++)
                {
                    // main objects

                    for(var j=0;j<summaryData[i].Summary.length;j++)
                    {
                        summaryData[i].Summary[j].IdleTime=TimeFromatter(summaryData[i].Summary[j].IdleTime,"HH:mm:ss");
                        summaryData[i].Summary[j].AfterWorkTime=TimeFromatter(summaryData[i].Summary[j].AfterWorkTime,"HH:mm:ss");
                        summaryData[i].Summary[j].AverageHandlingTime=TimeFromatter(summaryData[i].Summary[j].AverageHandlingTime,"HH:mm:ss");
                        summaryData[i].Summary[j].StaffTime=TimeFromatter(summaryData[i].Summary[j].StaffTime,"HH:mm:ss");
                        summaryData[i].Summary[j].TalkTime=TimeFromatter(summaryData[i].Summary[j].TalkTime,"HH:mm:ss");
                        summaryData[i].Summary[j].TalkTimeOutbound=TimeFromatter(summaryData[i].Summary[j].TalkTimeOutbound,"HH:mm:ss");
                        summaryData[i].Summary[j].BreakTime=TimeFromatter(summaryData[i].Summary[j].BreakTime,"HH:mm:ss");

                        agentSummaryList.push(summaryData[i].Summary[j]);
                    }
                }

                for(var i=0;i<agentSummaryList.length;i++)
                {
                    //$scope.agentSummaryList[i].AverageHandlingTime=Math.round($scope.agentSummaryList[i].AverageHandlingTime * 100) / 100;
                    for(var j=0;j<$scope.Agents.length;j++)
                    {
                        if($scope.Agents[j].ResourceId==agentSummaryList[i].Agent)
                        {
                            agentSummaryList[i].AgentName=$scope.Agents[j].ResourceName;

                        }
                    }
                }
                //$scope.AgentDetailsAssignToSummery();
                deferred.resolve(agentSummaryList);
            }

        }, function (error) {
            loginService.isCheckResponse(error);
            console.log("Error in Queue Summary loading ",error);
            deferred.reject(agentSummaryList);
        });

        return deferred.promise;
    };

    $scope.getAgents = function () {
        agentSummaryBackendService.getAgentDetails().then(function (response) {
            if(response.data.IsSuccess)
            {
                console.log("Agents "+response.data.Result);
                console.log(response.data.Result.length+" Agent records found");
                $scope.Agents = response.data.Result;
            }
            else
            {
                console.log("Error in Agent details picking");
            }
        }, function (error) {
            loginService.isCheckResponse(error);
            console.log("Error in Agent details picking "+error);
        });
    };

    $scope.AgentDetailsAssignToSummery = function () {


        for(var i=0;i<$scope.agentSummaryList.length;i++)
        {
            //$scope.agentSummaryList[i].AverageHandlingTime=Math.round($scope.agentSummaryList[i].AverageHandlingTime * 100) / 100;
            for(var j=0;j<$scope.Agents.length;j++)
            {
                if($scope.Agents[j].ResourceId==$scope.agentSummaryList[i].Agent)
                {
                    $scope.agentSummaryList[i].AgentName=$scope.Agents[j].ResourceName;

                }
            }
        }
    };

    var TimeFromatter = function (mins,timeFormat) {

        var timeStr = '00:00:00';
        if(mins > 0)
        {
            var durationObj = moment.duration(mins * 1000);

            var totalHrs = Math.floor(durationObj.asHours());

            var temphrs = '00';


            if(totalHrs > 0 && totalHrs < 10)
            {
                temphrs = '0' + totalHrs;
            }
            else if(durationObj._data.hours >= 10)
            {
                temphrs = totalHrs;
            }

            var tempmins = '00';

            if(durationObj._data.minutes > 0 && durationObj._data.minutes < 10)
            {
                tempmins = '0' + durationObj._data.minutes;
            }
            else if(durationObj._data.minutes >= 10)
            {
                tempmins = durationObj._data.minutes;
            }

            var tempsec = '00';

            if(durationObj._data.seconds > 0 && durationObj._data.seconds < 10)
            {
                tempsec = '0' + durationObj._data.seconds;
            }
            else if(durationObj._data.seconds >= 10)
            {
                tempsec = durationObj._data.seconds;
            }

            timeStr = temphrs + ':' + tempmins + ':' + tempsec;
        }

        return timeStr;

    };

    $scope.getAgents();

});