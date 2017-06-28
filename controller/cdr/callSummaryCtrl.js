(function () {
    var app = angular.module("veeryConsoleApp");

    var callSummaryCtrl = function ($scope, $filter, $timeout, loginService, cdrApiHandler, baseUrls,$anchorScroll) {

        $anchorScroll();
        $scope.showAlert = function (tittle, type, content) {

            new PNotify({
                title: tittle,
                text: content,
                type: type,
                styling: 'bootstrap3'
            });
        };

        $scope.dtOptions = {paging: false, searching: false, info: false, order: [0, 'asc']};


        $scope.obj = {
            dateofmonth: moment().format("YYYY-MM-DD")
        };

        $scope.obj2 = {
            startDay: moment().format("YYYY-MM-DD"),
            endDay: moment().format("YYYY-MM-DD")
        };


        $scope.cancelDownload = true;
        $scope.buttonClass = 'fa fa-file-text';
        $scope.fileDownloadState = 'RESET';
        $scope.currentCSVFilename = '';
        $scope.DownloadButtonName = 'CSV';

        $scope.cancelDownloadDaily = true;
        $scope.buttonClassDaily = 'fa fa-file-text';
        $scope.fileDownloadStateDaily = 'RESET';
        $scope.currentCSVFilenameDaily = '';
        $scope.DownloadButtonNameDaily = 'CSV';


        $scope.callSummaryHrList = [];
        $scope.callSummaryDayList = [];


        var isEmpty = function (map) {
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        };

        var convertToMMSS = function (sec) {
            var minutes = Math.floor(sec / 60);

            if (minutes < 10) {
                minutes = '0' + minutes;
            }

            var seconds = sec - minutes * 60;

            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            return minutes + ':' + seconds;
        };

        var checkFileReady = function (fileName) {
            console.log('METHOD CALL');
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
                                $scope.buttonClass = 'fa fa-file-text';
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

        var checkCSVGenerateAllowedDay = function () {
            try {
                var prevDay = moment().subtract(1, 'days');

                var isAllowed = prevDay.isBetween($scope.obj2.startDay, $scope.obj2.endDay) || prevDay.isBefore($scope.obj2.startDay) || prevDay.isBefore($scope.obj2.endDay);

                return !isAllowed;
            }
            catch (ex) {
                return false;
            }

        };

        var checkCSVGenerateAllowedHour = function () {
            try {
                var prevDay = moment().subtract(1, 'days');

                var isAllowed = prevDay.isBefore($scope.obj.dateofmonth);

                return !isAllowed;
            }
            catch (ex) {
                return false;
            }

        };

        $scope.downloadPress = function () {
            $scope.fileDownloadState = 'RESET';
            $scope.DownloadButtonName = 'CSV';
            $scope.cancelDownload = true;
            $scope.buttonClass = 'fa fa-file-text';
            $scope.buttonClassDaily = 'fa fa-file-text';
        };

        var checkFileReadyDaily = function (fileName) {
            console.log('METHOD CALL');
            if ($scope.cancelDownloadDaily) {
                $scope.fileDownloadStateDaily = 'RESET';
                $scope.DownloadButtonNameDaily = 'CSV';

            }
            else {
                cdrApiHandler.getFileMetaData(fileName).then(function (fileStatus) {
                    if (fileStatus && fileStatus.Result) {
                        if (fileStatus.Result.Status === 'PROCESSING') {
                            $timeout(checkFileReadyDaily(fileName), 10000);
                        }
                        else {


                            var decodedToken = loginService.getTokenDecode();

                            if (decodedToken && decodedToken.company && decodedToken.tenant) {
                                $scope.currentCSVFilenameDaily = fileName;
                                $scope.DownloadCSVFileUrl = baseUrls.fileServiceInternalUrl + 'File/DownloadLatest/' + decodedToken.tenant + '/' + decodedToken.company + '/' + fileName;
                                $scope.fileDownloadStateDaily = 'READY';
                                $scope.DownloadButtonNameDaily = 'CSV';
                                $scope.cancelDownloadDaily = true;
                                $scope.buttonClassDaily = 'fa fa-file-text';
                            }
                            else {
                                $scope.fileDownloadStateDaily = 'RESET';
                                $scope.DownloadButtonNameDaily = 'CSV';
                            }


                        }
                    }
                    else {
                        $scope.fileDownloadStateDaily = 'RESET';
                        $scope.DownloadButtonNameDaily = 'CSV';
                    }

                }).catch(function (err) {
                    loginService.isCheckResponse(err);
                    $scope.fileDownloadStateDaily = 'RESET';
                    $scope.DownloadButtonNameDaily = 'CSV';
                });
            }

        };

        $scope.downloadPressDaily = function () {
            $scope.fileDownloadStateDaily = 'RESET';
            $scope.DownloadButtonNameDaily = 'CSV';
            $scope.cancelDownloadDaily = true;
        };


        $scope.getHourlySummaryCSVDownload = function () {
            if (checkCSVGenerateAllowedHour()) {
                if ($scope.DownloadButtonName === 'CSV') {
                    $scope.cancelDownload = false;
                    $scope.buttonClass = 'fa fa-spinner fa-spin';
                }
                else {
                    $scope.cancelDownload = true;
                    $scope.buttonClass = 'fa fa-file-text';
                }

                $scope.DownloadButtonName = 'PROCESSING...';

                try {

                    var momentTz = moment.parseZone(new Date()).format('Z');
                    momentTz = momentTz.replace("+", "%2B");

                    cdrApiHandler.getCallSummaryForHrDownload($scope.obj.dateofmonth, momentTz, 'csv').then(function (cdrResp) {
                        if (!cdrResp.Exception && cdrResp.IsSuccess && cdrResp.Result) {
                            var downloadFilename = cdrResp.Result;

                            checkFileReady(downloadFilename);

                        }
                        else {
                            $scope.showAlert('Error', 'error', 'Error occurred while loading summary list');
                            $scope.fileDownloadState = 'RESET';
                            $scope.DownloadButtonName = 'CSV';
                        }


                    }, function (err) {
                        loginService.isCheckResponse(err);
                        $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading summary list');
                        $scope.fileDownloadState = 'RESET';
                        $scope.DownloadButtonName = 'CSV';
                    })
                }
                catch (ex) {
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading summary list');
                    $scope.fileDownloadState = 'RESET';
                    $scope.DownloadButtonName = 'CSV';
                }
            }
            else {
                $scope.showAlert('Warning', 'warn', 'Downloading is only allowed for previous dates');
            }

        };

        $scope.getDailySummaryCSVDownload = function () {
            if (checkCSVGenerateAllowedDay()) {
                if ($scope.DownloadButtonNameDaily === 'CSV') {
                    $scope.cancelDownloadDaily = false;
                    $scope.buttonClassDaily = 'fa fa-spinner fa-spin';
                }
                else {
                    $scope.cancelDownloadDaily = true;
                    $scope.buttonClassDaily = 'fa fa-file-text';
                }

                $scope.DownloadButtonNameDaily = 'PROCESSING...';

                try {

                    var momentTz = moment.parseZone(new Date()).format('Z');
                    momentTz = momentTz.replace("+", "%2B");

                    cdrApiHandler.getCallSummaryForDayDownload($scope.obj2.startDay, $scope.obj2.endDay, momentTz, 'csv').then(function (cdrResp) {
                        if (!cdrResp.Exception && cdrResp.IsSuccess && cdrResp.Result) {
                            var downloadFilename = cdrResp.Result;

                            checkFileReadyDaily(downloadFilename);

                        }
                        else {
                            $scope.showAlert('Error', 'error', 'Error occurred while loading summary list');
                            $scope.fileDownloadStateDaily = 'RESET';
                            $scope.DownloadButtonNameDaily = 'CSV';
                        }


                    }, function (err) {
                        loginService.isCheckResponse(err);
                        $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading summary list');
                        $scope.fileDownloadStateDaily = 'RESET';
                        $scope.DownloadButtonNameDaily = 'CSV';
                    })
                }
                catch (ex) {
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading summary list');
                    $scope.fileDownloadStateDaily = 'RESET';
                    $scope.DownloadButtonNameDaily = 'CSV';
                }
            }
            else {
                $scope.showAlert('Warning', 'warn', 'Downloading is only allowed for previous dates');
            }

        };


        $scope.getCallSummary = function () {

            try {

                var momentTz = moment.parseZone(new Date()).format('Z');
                momentTz = momentTz.replace("+", "%2B");

                $scope.obj.isTableLoadingHr = 0;

                cdrApiHandler.getCallSummaryForHr($scope.obj.dateofmonth, momentTz).then(function (sumResp) {
                    if (!sumResp.Exception && sumResp.IsSuccess && sumResp.Result) {
                        if (!isEmpty(sumResp.Result)) {
                            var newSummary = sumResp.Result.map(function (sumr) {

                                if (typeof sumr.IvrAverage === "number") {
                                    sumr.IvrAverage = convertToMMSS(sumr.IvrAverage);
                                }

                                if (typeof sumr.HoldAverage === "number") {
                                    sumr.HoldAverage = convertToMMSS(sumr.HoldAverage);
                                }

                                if (typeof sumr.RingAverage === "number") {
                                    sumr.RingAverage = convertToMMSS(sumr.RingAverage);
                                }

                                if (typeof sumr.TalkAverage === "number") {
                                    sumr.TalkAverage = convertToMMSS(sumr.TalkAverage);
                                }

                                return sumr;
                            });

                            $scope.callSummaryHrList = newSummary;
                            $scope.obj.isTableLoadingHr = 1;
                        }
                        else {
                            $scope.showAlert('Info', 'info', 'No records to load');
                            $scope.obj.isTableLoadingHr = 1;

                        }


                    }
                    else {
                        $scope.showAlert('Error', 'error', 'Error occurred while loading call summary');
                        $scope.obj.isTableLoadingHr = 1;
                    }


                }, function (err) {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading call summary');
                    $scope.obj.isTableLoadingHr = 1;
                })
            }
            catch (ex) {
                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading call summary');
                $scope.obj.isTableLoadingHr = 1;
            }

        };

        $scope.getCallSummaryDaily = function () {
            try {
                var momentTz = moment.parseZone(new Date()).format('Z');
                momentTz = momentTz.replace("+", "%2B");

                $scope.obj.isTableLoadingDay = 0;

                cdrApiHandler.getCallSummaryForDay($scope.obj2.startDay, $scope.obj2.endDay, momentTz).then(function (sumResp) {
                    if (!sumResp.Exception && sumResp.IsSuccess && sumResp.Result) {
                        if (!isEmpty(sumResp.Result)) {

                            var newSummary = sumResp.Result.map(function (sumr) {

                                if (typeof sumr.IvrAverage === "number") {
                                    sumr.IvrAverage = convertToMMSS(sumr.IvrAverage);
                                }

                                if (typeof sumr.HoldAverage === "number") {
                                    sumr.HoldAverage = convertToMMSS(sumr.HoldAverage);
                                }

                                if (typeof sumr.RingAverage === "number") {
                                    sumr.RingAverage = convertToMMSS(sumr.RingAverage);
                                }

                                if (typeof sumr.TalkAverage === "number") {
                                    sumr.TalkAverage = convertToMMSS(sumr.TalkAverage);
                                }

                                return sumr;
                            });

                            $scope.callSummaryDayList = newSummary;
                            $scope.obj.isTableLoadingDay = 1;
                        }
                        else {
                            $scope.showAlert('Info', 'info', 'No records to load');
                            $scope.obj.isTableLoadingDay = 1;

                        }


                    }
                    else {
                        $scope.showAlert('Error', 'error', 'Error occurred while loading call summary');
                        $scope.obj.isTableLoadingDay = 1;
                    }


                }, function (err) {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading call summary');
                    $scope.obj.isTableLoadingDay = 1;
                })
            }
            catch (ex) {
                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading call summary');
                $scope.obj.isTableLoadingDay = 1;
            }

        };


    };
    app.controller("callSummaryCtrl", callSummaryCtrl);

}());


