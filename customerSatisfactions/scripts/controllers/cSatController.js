mainApp.controller('cSatController', function ($scope, $filter, $anchorScroll, $q, cSatService) {
    $anchorScroll();

    // search
    $scope.StartTime = {
        date: new Date()
    };
    $scope.EndTime = {
        date: new Date()
    };
    $scope.openCalendar = function (name) {
        if (name == 'StartTime') {
            $scope.StartTime.open = true;
        }
        else {
            $scope.EndTime.open = true;
        }

    };
    $scope.csatSerach = {};
    var d = new Date();
    d.setDate(d.getDate() - 1);
    $scope.csatSerach.StartTime = d;
    $scope.csatSerach.EndTime = new Date();
    // search end

    $scope.enableSearchButton = true;
    $scope.dtOptions = {paging: false, searching: false, info: false, order: [6, 'desc']};
    $scope.pageSizRange = [100, 500, 1000, 5000, 10000];
    $scope.isLoading = false;
    $scope.noDataToshow = false;
    $scope.showPaging = false;
    $scope.currentPage = "1";
    $scope.pageTotal = "1";
    $scope.pageSize = 100;
    $scope.noDataToshow = false;
    $scope.satisfactionRequest = [];
    $scope.getPageData = function (Paging, page, pageSize, total) {
        $scope.isLoading = true;
        cSatService.GetSatisfactionRequest(page, pageSize, $scope.csatSerach.StartTime.toUTCString(), $scope.csatSerach.EndTime.toUTCString(), $scope.satisfaction).then(function (response) {
            if (response) {
                $scope.satisfactionRequest = response;
                $scope.showPaging = true;
            }
            $scope.satisfaction = "all";
            $scope.isLoading = false;
        }, function (err) {
            $scope.satisfaction = "all";
            showAlert("IVR", "error", "Fail To Get Satisfaction Details.");
        });
    };

    //$scope.getPageData(0, $scope.currentPage, $scope.pageSize, $scope.pageTotal);

    $scope.doughnutObj = {labels: [], data: []};
    $scope.options = {
        type: 'doughnut',
        responsive: false,
        legend: {
            display: true,
            position: 'bottom',
            padding: 5,
            labels: {
                fontColor: 'rgb(130, 152, 174)',
                fontSize: 10,
                boxWidth: 10
            }
        },
        title: {
            display: true
        }
    };

    var showAlert = function (tittle, type, content) {
        new PNotify({
            title: tittle,
            text: content,
            type: type,
            styling: 'bootstrap3'
        });
    };

    $scope.responseRate = 0;
    $scope.goodRate = 0;
    var calculateReating = function () {
        var curRes = ($scope.pageTotal - $scope.offered);
        $scope.responseRate = ((curRes / $scope.pageTotal) * 100);
        if ($scope.responseRate <= 100) {
            if ($scope.responseRate < 0) {
                $scope.responseRate = 0;
            }
            else
                $scope.responseRate = $scope.responseRate.toFixed(2);
        }
        else {
            $scope.responseRate = 0;
        }

        $scope.goodRate = (($scope.good / curRes) * 100);
        if ($scope.goodRate <= 100) {
            if ($scope.goodRate < 0) {
                $scope.goodRate = 0;
            }
            else
                $scope.goodRate = $scope.goodRate.toFixed(2);
        }
        else {
            $scope.goodRate = 0;
        }
    };

    $scope.satisfactionReport = {};
    $scope.offered = 0;
    var GetSatisfactionRequestReport = function () {
        $scope.doughnutObj = {labels: [], data: []};
        $scope.isLoading = true;
        $scope.offered = 0;
        $scope.good = 0;
        cSatService.GetSatisfactionRequestReport($scope.csatSerach.StartTime.toUTCString(), $scope.csatSerach.EndTime.toUTCString()).then(function (response) {
            if (response) {
                $scope.satisfactionReport = response;
                angular.forEach(response, function (item) {
                    if (item) {
                        $scope.doughnutObj.labels.push(item._id);
                        $scope.doughnutObj.data.push(item.satisfactions);
                        if (item._id === 'offered')
                            $scope.offered = item.satisfactions;
                        if (item._id === 'good')
                            $scope.good = item.satisfactions;
                    }
                });
            }
            else {
                $scope.noDataToshow = true;
            }
            $scope.isLoading = false;
            calculateReating();
        }, function (err) {
            $scope.isLoading = false;
            showAlert("IVR", "error", "Fail To Get Satisfaction Report.");
        });
    };
    //GetSatisfactionRequestReport();

    $scope.pageTotal = 0;
    var GetSatisfactionRequestCount = function () {
        $scope.pageTotal = 0;
        cSatService.GetSatisfactionRequestCount($scope.csatSerach.StartTime.toUTCString(), $scope.csatSerach.EndTime.toUTCString(), $scope.satisfaction).then(function (response) {
            if (response) {
                $scope.pageTotal = response;
            }
            else {
                $scope.pageTotal = 0;
            }
            calculateReating();
        }, function (err) {
            showAlert("IVR", "error", "Fail To Get Total Satisfaction Count.");
        });
    };
    //GetSatisfactionRequestCount();

    $scope.searchData = function () {
        if ($scope.csatSerach.StartTime >= $scope.csatSerach.EndTime) {
            showAlert("Search", "error", "End Time Should Be Greater Than Start Time.");
            return
        }

        GetSatisfactionRequestCount();
        $scope.getPageData(0, $scope.currentPage, $scope.pageSize, $scope.pageTotal);
        GetSatisfactionRequestReport();
    };

    $scope.satisfaction = "all";
    $scope.searchDataBySatisfaction = function (satisfaction) {
        $('.widget-dy-wrp').removeClass('active');
        $('#' + satisfaction).addClass('active');
        $scope.satisfaction = satisfaction;
        $scope.getPageData(0, $scope.currentPage, $scope.pageSize, $scope.pageTotal);

    };


});
