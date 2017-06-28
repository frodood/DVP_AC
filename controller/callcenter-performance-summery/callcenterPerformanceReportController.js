/**
 * Created by Heshan.i on 5/19/2017.
 */

(function () {

    mainApp.controller('callcenterPerformanceReportController', function ($scope, $anchorScroll, $timeout, loginService, dashboardService, cdrApiHandler, baseUrls) {

        $anchorScroll();

        $scope.startDate = moment().format("YYYY-MM-DD");
        $scope.endDate = moment().format("YYYY-MM-DD");
        $scope.dateValid = true;

        $scope.reportData = [];
        $scope.isTableLoading = -1;

        $scope.cancelDownload = true;
        $scope.buttonClass = 'fa fa-file-text';
        $scope.fileDownloadState = 'RESET';
        $scope.currentCSVFilename = '';
        $scope.DownloadButtonName = 'CSV';




        var showAlert = function (title,content,type) {
            new PNotify({
                title: title,
                text: content,
                type: type,
                styling: 'bootstrap3'
            });
        };

        var TimeFormatter = function (seconds) {

            var timeStr = '0:0:0';
            if(seconds > 0) {
                var durationObj = moment.duration(seconds * 1000);

                if (durationObj) {
                    var tempHrs = 0;
                    if (durationObj._data.years > 0) {
                        tempHrs = tempHrs + durationObj._data.years * 365 * 24;
                    }
                    if (durationObj._data.months > 0) {
                        tempHrs = tempHrs + durationObj._data.months * 30 * 24;
                    }
                    if (durationObj._data.days > 0) {
                        tempHrs = tempHrs + durationObj._data.days * 24;
                    }

                    tempHrs = tempHrs + durationObj._data.hours;
                    timeStr = tempHrs + ':' + durationObj._data.minutes + ':' + durationObj._data.seconds;
                }
            }
            return timeStr;
        };

        var checkFileReady = function (fileName) {

            if ($scope.cancelDownload) {
                $scope.fileDownloadState = 'RESET';
                $scope.DownloadButtonName = 'CSV';
            }
            else {
                cdrApiHandler.getFileMetaData(fileName).then(function (fileStatus) {
                    if (fileStatus && fileStatus.Result) {
                        if (fileStatus.Result.Status === 'PROCESSING') {
                            $timeout(checkFileReady(fileName), 10000);
                        }
                        else {


                            var decodedToken = loginService.getTokenDecode();

                            if (decodedToken && decodedToken.company && decodedToken.tenant) {
                                $scope.currentCSVFilename = fileName;
                                $scope.DownloadCSVFileUrl = baseUrls.fileServiceInternalUrl + 'File/DownloadLatest/' + decodedToken.tenant + '/' + decodedToken.company + '/' + fileName;
                                $scope.fileDownloadState = 'READY';
                                $scope.DownloadButtonName = 'CSV';
                                $scope.cancelDownload = true;
                                $scope.buttonClass = 'fa fa-spinner fa-spin';
                            }
                            else {
                                $scope.fileDownloadState = 'RESET';
                                $scope.DownloadButtonName = 'CSV';
                            }


                        }
                    }
                    else {
                        $scope.fileDownloadState = 'RESET';
                        $scope.DownloadButtonName = 'CSV';
                    }

                }).catch(function (err) {
                    loginService.isCheckResponse(err);
                    $scope.fileDownloadState = 'RESET';
                    $scope.DownloadButtonName = 'CSV';
                });
            }

        };


        $scope.downloadPress = function () {
            $scope.fileDownloadState = 'RESET';
            $scope.DownloadButtonName = 'CSV';
            $scope.cancelDownload = true;
            $scope.buttonClass = 'fa fa-file-text';
        };

        $scope.onDateChange = function () {
            $scope.dateValid = moment($scope.startDate, "YYYY-MM-DD").isValid() && moment($scope.endDate, "YYYY-MM-DD").isValid();
        };

        $scope.prepareToDownload = function () {
            if ($scope.DownloadButtonName === 'CSV') {
                $scope.cancelDownload = false;
                $scope.buttonClass = 'fa fa-spinner fa-spin';
            }
            else {
                $scope.cancelDownload = true;
                $scope.buttonClass = 'fa fa-file-text';
            }

            $scope.DownloadButtonName = 'PROCESSING...';

            dashboardService.GetCallCenterPerformanceHistory($scope.startDate, $scope.endDate, 'download').then(function (response) {
                if (response) {
                    checkFileReady(response);
                }else{
                    showAlert('Call Center Performance', 'No Records Found', 'error');
                    $scope.fileDownloadState = 'RESET';
                    $scope.DownloadButtonName = 'CSV';
                }
            }, function (err) {
                loginService.isCheckResponse(err);
                $scope.fileDownloadState = 'RESET';
                $scope.DownloadButtonName = 'CSV';
            });

        };

        $scope.loadReportData = function () {
            $scope.reportData = [];
            $scope.isTableLoading = 0;
            dashboardService.GetCallCenterPerformanceHistory($scope.startDate, $scope.endDate, 'report').then(function (response) {
                if (response && response.length > 0) {
                    $scope.reportData = response.map(function (record) {

                        record.Date = moment(record.Date).format("YYYY-MM-DD");
                        record.totalStaffTime = TimeFormatter(record.totalStaffTime);
                        record.totalAcwTime = TimeFormatter(record.totalAcwTime);
                        record.AverageStaffTime = TimeFormatter(record.AverageStaffTime);
                        record.AverageAcwTime = TimeFormatter(record.AverageAcwTime);
                        record.totalTalkTimeInbound = TimeFormatter(record.totalTalkTimeInbound);
                        record.totalTalkTimeOutbound = TimeFormatter(record.totalTalkTimeOutbound);
                        record.totalBreakTime = TimeFormatter(record.totalBreakTime);
                        record.totalHoldTime = TimeFormatter(record.totalHoldTime);
                        record.totalIdleTime = TimeFormatter(record.totalIdleTime);
                        record.AverageTalkTimeInbound = TimeFormatter(record.AverageTalkTimeInbound);
                        record.AverageTalkTimeOutbound = TimeFormatter(record.AverageTalkTimeOutbound);

                        return record;
                    });

                    $scope.isTableLoading = 1;
                }else{
                    $scope.isTableLoading = 2;
                    showAlert('Call Center Performance', 'No Records Found', 'error')
                }
            }, function (err) {
                loginService.isCheckResponse(err);
            });

        };

    });

}());