/**
 * Created by Damith on 9/28/2016.
 */

mainApp.controller('timeSheetCtrl', function ($scope, $http, $interval, uiGridGroupingConstants, userProfileApiAccess,
                                              loginService,
                                              timerServiceAccess) {


    $scope.showAlert = function (tittle, type, msg) {
        new PNotify({
            title: tittle,
            text: msg,
            type: type,
            styling: 'bootstrap3',
            icon: false
        });
    };

    $scope.searchObj = {userId:undefined, startDate:undefined, endDate:undefined};

    $scope.gridOptions = {
        enableSorting: true,
        enableFiltering: true,
        showGridFooter: true,
        showColumnFooter: true,
        columnDefs: [
            {name: 'TicketId', grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'asc' }, width: '10%', field: 'ticket.tid',grouping: { groupPriority: 1 }},
            {name: 'Subject', width: '40%', field: 'ticket.subject'},
            {name: 'Date', grouping: { groupPriority: 1 }, sort: { priority: 1, direction: 'asc' }, width: '15%', field: 'startTime'},
            {name: 'Duration', width: '15%', field: 'time', cellFilter: 'durationFilter',treeAggregationType: uiGridGroupingConstants.aggregation.SUM, customTreeAggregationFinalizerFn: function( aggregation ) {
                //aggregation.rendered = aggregation.value;

                var durationObj = moment.duration(aggregation.value);
                aggregation.rendered = durationObj._data.days+'d::'+durationObj._data.hours+'h::'+durationObj._data.minutes+'m::'+durationObj._data.seconds+'s';

            }},
            {name: 'DurationSummary', width: '15%', field: 'time', treeAggregationType: uiGridGroupingConstants.aggregation.SUM, customTreeAggregationFinalizerFn: function( aggregation ) {
                //aggregation.rendered = aggregation.value;

                var durationObj = moment.duration(aggregation.value);
                aggregation.rendered = durationObj._data.days+'d::'+durationObj._data.hours+'h::'+durationObj._data.minutes+'m::'+durationObj._data.seconds+'s';

            }}
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };// grid option

    $scope.expandAll = function () {
        $scope.gridApi.treeBase.expandAllRows();
    };

    $scope.toggleRow = function (rowNum) {
        $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[rowNum]);
    };

    $scope.toggleExpandNoChildren = function () {
        $scope.gridOptions.showTreeExpandNoChildren = !$scope.gridOptions.showTreeExpandNoChildren;
        $scope.gridApi.grid.refresh();
    };

    $scope.changeGroupingDate = function() {
        $scope.gridApi.grouping.clearGrouping();
        $scope.gridApi.grouping.groupColumn('Date');
        $scope.gridApi.grouping.aggregateColumn('TicketId', uiGridGroupingConstants.aggregation.COUNT);
    };

    $scope.changeGroupingTicket = function() {
        $scope.gridApi.grouping.clearGrouping();
        $scope.gridApi.grouping.groupColumn('TicketId');
        $scope.gridApi.grouping.aggregateColumn('Duration', uiGridGroupingConstants.aggregation.COUNT);
    };

    $scope.loadUserData = function(){
        userProfileApiAccess.getUsers().then(function (response) {
            if(response){
                if(response.IsSuccess){
                    $scope.userDataList = response.Result;
                }else{
                    var errMsg = response.CustomMessage;
                    $scope.showAlert('Error', 'error', errMsg);
                }
            }else{
                $scope.showAlert('Error', 'error', 'Load User Data Failed');
            }
        }, function (err) {
            loginService.isCheckResponse(err);
            var errMsg = "Get User Data Failed";
            if (err.statusText) {
                errMsg = err.statusText;
            }
            $scope.showAlert('Error', 'error', errMsg);
        });
    };

    $scope.searchSheetData = function(){
        timerServiceAccess.getTimersByUser($scope.searchObj.userId, $scope.searchObj.startDate, $scope.searchObj.endDate).then(function (response) {
            if(response){
                if(response.IsSuccess){
                    if(response.Result) {
                        var gidData = [];
                        for (var i = 0; i < response.Result.length; i++) {
                            var result = response.Result[i];
                            if(result && result.ticket){
                                result.startTime =  moment(result.startTime).format("MM-DD-YYYY");
                                gidData.push(result);
                            }
                        }
                        $scope.gridOptions.data = gidData;
                    }
                }else{
                    var errMsg = response.CustomMessage;
                    $scope.showAlert('Error', 'error', errMsg);
                }
            }else{
                $scope.showAlert('Error', 'error', 'Load User Data Failed');
            }
        }, function (err) {
            loginService.isCheckResponse(err);
            var errMsg = "Search Timers Failed";
            if (err.statusText) {
                errMsg = err.statusText;
            }
            $scope.showAlert('Error', 'error', errMsg);
        });
    };

    $scope.loadUserData();

});
