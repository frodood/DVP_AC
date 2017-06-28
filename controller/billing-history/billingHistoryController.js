/**
 * Created by Pawan on 11/22/2016.
 */

mainApp.controller("billingHistoryController", function ($scope,$filter,$state, $q,loginService,billingHistoryService,$anchorScroll)
{
    $anchorScroll();

    $scope.startDate = moment().format("YYYY-MM-DD");
    $scope.endDate = moment().format("YYYY-MM-DD");
    $scope.dateValid = true;
    $scope.agentSummaryList = [];
    $scope.Agents=[];
    $scope.summaryData=[];
    $scope.pageNo=1;
    $scope.rowCount=5;

    $scope.dtOptions = { paging: false, searching: false, info: false, order: [2, 'asc'] };




    var momentTz = moment.parseZone(new Date()).format('Z');
    momentTz = momentTz.replace("+", "%2B");

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


    $scope.getBillHistoryCSV = function () {


        $scope.DownloadFileName = 'BILL_HISTORY_SUMMARY_' + $scope.startDate + '_' + $scope.endDate;
        var deferred = $q.defer();

        /* var billData = $scope.summaryData.map(function (c,index) {

         return c;
         });*/


        //$scope.AgentDetailsAssignToSummery();
        deferred.resolve($scope.summaryData);

        return deferred.promise;


        /*$scope.historyList=[];
         billingHistoryService.getBillingHistory($scope.rowCount,$scope.pageNo).then(function (response) {

         if(!response.data.IsSuccess)
         {
         console.log("Bill history loading failed ",response.data.Exception);
         deferred.reject($scope.summaryData);
         }
         else
         {
         $scope.isTableLoading=1;

         var NewSummaryData=$scope.summaryData.concat(response.data.Result);
         $scope.summaryData=NewSummaryData;


         var billData = $scope.summaryData.map(function (c,index) {
         c.description = c.OtherJsonData.msg;
         return c;
         });


         //$scope.AgentDetailsAssignToSummery();
         deferred.resolve(billData);
         }

         }, function (error) {
         loginService.isCheckResponse(error);
         console.log("Error in Queue Summary loading ",error);
         deferred.reject(agentSummaryList);
         });

         return deferred.promise;*/
    };




    //$scope.getAgents();

    $scope.getBillingHistory = function () {

        billingHistoryService.getBillingHistory($scope.rowCount,$scope.pageNo).then(function (response) {

            if(!response.data.IsSuccess)
            {
                console.log("Bill History loading failed ",response.data.Exception);
            }
            else
            {
                $scope.isTableLoading=1;
                if(response.data.Result)
                {
                    //$scope.summaryData=$scope.summaryData.concat(response.data.Result);
                    $scope.summaryData=response.data.Result;
                    // $scope.pageNo+=1;
                    $scope.rowCount+=5;


                    $scope.summaryData = $scope.summaryData.map(function (c,index) {
                        c.description = c.OtherJsonData.msg;
                        c.Payment=0;
                        if(c.OtherJsonData.amount && c.OtherJsonData.amount>0)
                        {
                            c.Payment= (c.OtherJsonData.amount/100);
                        }

                        if(c.Credit && c.Credit>0)
                        {
                            c.Credit= (c.Credit/100).toFixed(2);;


                        }
                        else
                        {
                            c.Credit=0;
                        }

                        if(c.createdAt)
                        {
                            c.createdAt=new Date(c.createdAt);
                        }


                        return c;
                    });

                }


            }

        }, function (error) {
            console.log("Error in Bill History loading ",error);
        })
    };



    $scope.getBillingHistory();

});