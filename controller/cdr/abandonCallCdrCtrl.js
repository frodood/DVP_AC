/**
 * Created by dinusha on 6/15/2016.
 */
/**
 * Created by dinusha on 5/28/2016.
 */

(function () {
    var app = angular.module("veeryConsoleApp");

    var abandonCallCdrCtrl = function ($scope, $filter, $q, $timeout, cdrApiHandler, sipUserApiHandler, resourceService, loginService, baseUrls,$anchorScroll) {

        $anchorScroll();
        $scope.enableSearchButton = true;

        $scope.dtOptions = {paging: false, searching: false, info: false, order: [4, 'desc']};


        $scope.showAlert = function (tittle, type, content) {

            new PNotify({
                title: tittle,
                text: content,
                type: type,
                styling: 'bootstrap3'
            });
        };

        $scope.onDateChange = function () {
            if (moment($scope.startDate, "YYYY-MM-DD").isValid() && moment($scope.endDate, "YYYY-MM-DD").isValid()) {
                $scope.dateValid = true;
            }
            else {
                $scope.dateValid = false;
            }
        };

        $scope.startTimeNow = '00:00';
        $scope.endTimeNow = '00:00';

        $scope.startDate = moment().format("YYYY-MM-DD");
        $scope.endDate = moment().format("YYYY-MM-DD");

        $scope.hstep = 1;
        $scope.mstep = 15;

        //set loagin option
        $scope.isTableLoading = 3;
        $scope.cdrList = [];
        $scope.userList = [];
        $scope.attrList = [];

        var pageStack = [];

        var pageInfo = {};

        $scope.searchCriteria = "";

        $scope.recLimit = "10";

        $scope.isPreviousDisabled = true;
        $scope.isNextDisabled = true;

        $scope.top = -1;
        $scope.bottom = -1;

        $scope.startTimeNow = '12:00 AM';
        $scope.endTimeNow = '12:00 AM';

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

        $scope.dateValid = true;

        $scope.offset = -1;
        $scope.prevOffset = -1;

        $scope.cancelDownload = true;
        $scope.fileDownloadState = 'RESET';
        $scope.currentCSVFilename = '';
        $scope.DownloadButtonName = 'CSV';
        $scope.buttonClass = 'fa fa-file-text';

        $scope.loadNextPage = function () {
            var pageInfo = {
                top: $scope.top,
                bottom: $scope.bottom
            };
            pageStack.push(pageInfo);
            $scope.getProcessedCDR(pageInfo.bottom, false);

        };

        $scope.loadPreviousPage = function () {
            var prevPage = pageStack.pop();

            $scope.getProcessedCDR(prevPage.bottom + 1, false);

        };

        var isEmpty = function (map) {
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        };

        var checkCSVGenerateAllowed = function () {
            try {
                var prevDay = moment().subtract(1, 'days');

                var isAllowed = prevDay.isBetween($scope.startDate, $scope.endDate) || prevDay.isBefore($scope.startDate) || prevDay.isBefore($scope.endDate);

                return !isAllowed;
            }
            catch (ex) {
                return false;
            }

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
                $scope.buttonClass = 'fa fa-file-text';
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
                                $scope.cancelDownload = true;
                                $scope.buttonClass = 'fa fa-file-text';
                            }


                        }
                    }
                    else {
                        $scope.fileDownloadState = 'RESET';
                        $scope.DownloadButtonName = 'CSV';
                        $scope.cancelDownload = true;
                        $scope.buttonClass = 'fa fa-file-text';
                    }

                }).catch(function (err) {
                    loginService.isCheckResponse(err);
                    $scope.fileDownloadState = 'RESET';
                    $scope.DownloadButtonName = 'CSV';
                    $scope.cancelDownload = true;
                    $scope.buttonClass = 'fa fa-file-text';
                });
            }

        };

        var getUserList = function () {

            sipUserApiHandler.getSIPUsers().then(function (userList) {
                if (userList && userList.Result && userList.Result.length > 0) {
                    $scope.userList = userList.Result;
                }


            }).catch(function (err) {
                loginService.isCheckResponse(err);
            });
        };

        var getSkillList = function () {

            resourceService.GetAttributes().then(function (attrList) {
                if (attrList && attrList.length > 0) {
                    $scope.attrList = attrList;
                }


            }).catch(function (err) {
                loginService.isCheckResponse(err);
            });
        };

        getUserList();
        getSkillList();

        $scope.downloadPress = function () {
            $scope.fileDownloadState = 'RESET';
            $scope.DownloadButtonName = 'CSV';
            $scope.cancelDownload = true;
            $scope.buttonClass = 'fa fa-file-text';
        };


        $scope.getProcessedCDRCSVDownload = function () {
            /*if (checkCSVGenerateAllowed()) {

            }
            else {
                $scope.showAlert('Warning', 'warn', 'Downloading is only allowed for previous dates');
            }*/

            if ($scope.DownloadButtonName === 'CSV') {
                $scope.cancelDownload = false;
                $scope.buttonClass = 'fa fa-spinner fa-spin';
            }
            else {
                $scope.cancelDownload = true;
                $scope.buttonClass = 'fa fa-file-text';
            }

            $scope.DownloadButtonName = 'PROCESSING...';

            //$scope.DownloadFileName = 'ABANDONCALLCDR_' + $scope.startDate + ' ' + $scope.startTimeNow + '_' + $scope.endDate + ' ' + $scope.endTimeNow;

            try {

                var momentTz = moment.parseZone(new Date()).format('Z');
                //var encodedTz = encodeURI(momentTz);
                momentTz = momentTz.replace("+", "%2B");

                var st = moment($scope.startTimeNow, ["h:mm A"]).format("HH:mm");
                var et = moment($scope.endTimeNow, ["h:mm A"]).format("HH:mm");

                var startDate = $scope.startDate + ' ' + st + ':00' + momentTz;
                var endDate = $scope.endDate + ' ' + et + ':59' + momentTz;

                if (!$scope.timeEnabledStatus) {
                    startDate = $scope.startDate + ' 00:00:00' + momentTz;
                    endDate = $scope.endDate + ' 23:59:59' + momentTz;
                }

                cdrApiHandler.prepareDownloadCDRAbandonByType(startDate, endDate, $scope.agentFilter, $scope.skillFilter, null, null, $scope.custFilter, null, 'csv', momentTz).then(function (cdrResp)
                    //cdrApiHandler.getAbandonCDRForTimeRange(startDate, endDate, 0, 0, $scope.agentFilter, $scope.skillFilter, $scope.custFilter).then(function (cdrResp)
                {
                    if (!cdrResp.Exception && cdrResp.IsSuccess && cdrResp.Result) {
                        var downloadFilename = cdrResp.Result;

                        checkFileReady(downloadFilename);

                    }
                    else {
                        $scope.showAlert('Error', 'error', 'Error occurred while loading cdr list');
                        $scope.fileDownloadState = 'RESET';
                        $scope.DownloadButtonName = 'CSV';
                    }


                }, function (err) {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading cdr list');
                    $scope.fileDownloadState = 'RESET';
                    $scope.DownloadButtonName = 'CSV';
                })
            }
            catch (ex) {
                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading cdr list')
                $scope.fileDownloadState = 'RESET';
                $scope.DownloadButtonName = 'CSV';
            }

        };

        $scope.getProcessedCDRForCSV = function () {
            $scope.DownloadFileName = 'ABANDONCALLCDR_' + $scope.startDate + ' ' + $scope.startTimeNow + '_' + $scope.endDate + ' ' + $scope.endTimeNow;

            var deferred = $q.defer();

            var cdrListForCSV = [];

            try {

                var momentTz = moment.parseZone(new Date()).format('Z');
                //var encodedTz = encodeURI(momentTz);
                momentTz = momentTz.replace("+", "%2B");

                var st = moment($scope.startTimeNow, ["h:mm A"]).format("HH:mm");
                var et = moment($scope.endTimeNow, ["h:mm A"]).format("HH:mm");

                var startDate = $scope.startDate + ' ' + st + ':00' + momentTz;
                var endDate = $scope.endDate + ' ' + et + ':59' + momentTz;

                if (!$scope.timeEnabledStatus) {
                    startDate = $scope.startDate + ' 00:00:00' + momentTz;
                    endDate = $scope.endDate + ' 23:59:59' + momentTz;
                }


                var lim = parseInt($scope.recLimit);
                cdrApiHandler.getAbandonCDRForTimeRange(startDate, endDate, 0, 0, $scope.agentFilter, $scope.skillFilter, $scope.custFilter).then(function (cdrResp) {
                    if (!cdrResp.Exception && cdrResp.IsSuccess && cdrResp.Result) {
                        if (!isEmpty(cdrResp.Result)) {
                            var count = 0;
                            for (cdr in cdrResp.Result) {
                                count++;
                                var cdrAppendObj = {};
                                var outLegProcessed = false;
                                var curCdr = cdrResp.Result[cdr];
                                var isInboundHTTAPI = false;
                                var outLegAnswered = false;

                                var callHangupDirectionA = '';
                                var callHangupDirectionB = '';

                                var len = curCdr.length;


                                //Need to filter out inbound and outbound legs before processing

                                var filteredInb = curCdr.filter(function (item) {
                                    if (item.Direction === 'inbound') {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }

                                });

                                var filteredOutb = curCdr.filter(function (item) {
                                    if (item.Direction === 'outbound') {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }

                                });


                                //process inbound legs first

                                for (i = 0; i < filteredInb.length; i++) {
                                    var curProcessingLeg = filteredInb[i];

                                    if (curProcessingLeg.DVPCallDirection) {
                                        callHangupDirectionA = curProcessingLeg.HangupDisposition;
                                    }


                                    cdrAppendObj.Uuid = curProcessingLeg.Uuid;
                                    cdrAppendObj.SipFromUser = curProcessingLeg.SipFromUser;
                                    cdrAppendObj.SipToUser = curProcessingLeg.SipToUser;
                                    cdrAppendObj.IsAnswered = false;

                                    cdrAppendObj.HangupCause = curProcessingLeg.HangupCause;

                                    var localTime = moment(curProcessingLeg.CreatedTime).local().format("YYYY-MM-DD HH:mm:ss");

                                    cdrAppendObj.CreatedTime = localTime;
                                    cdrAppendObj.Duration = curProcessingLeg.Duration;
                                    cdrAppendObj.BillSec = 0;
                                    cdrAppendObj.HoldSec = 0;

                                    cdrAppendObj.DVPCallDirection = curProcessingLeg.DVPCallDirection;

                                    if (cdrAppendObj.DVPCallDirection === 'inbound') {
                                        var holdSecTemp = curProcessingLeg.HoldSec + curProcessingLeg.WaitSec;
                                        cdrAppendObj.HoldSec = holdSecTemp;
                                    }


                                    cdrAppendObj.QueueSec = curProcessingLeg.QueueSec;
                                    cdrAppendObj.AgentSkill = curProcessingLeg.AgentSkill;


                                    cdrAppendObj.AnswerSec = curProcessingLeg.AnswerSec;


                                    if (curProcessingLeg.ObjType === 'HTTAPI') {
                                        isInboundHTTAPI = true;
                                    }

                                    cdrAppendObj.ObjType = curProcessingLeg.ObjType;
                                    cdrAppendObj.ObjCategory = curProcessingLeg.ObjCategory;


                                }

                                //process outbound legs next

                                var curProcessingLeg = null;

                                if (filteredOutb && filteredOutb.length > 0) {
                                    curProcessingLeg = filteredOutb[0];
                                }

                                if (curProcessingLeg) {
                                    callHangupDirectionB = curProcessingLeg.HangupDisposition;


                                    cdrAppendObj.RecievedBy = curProcessingLeg.SipToUser;

                                    cdrAppendObj.AnswerSec = curProcessingLeg.AnswerSec;


                                    if (cdrAppendObj.DVPCallDirection === 'outbound') {
                                        var holdSecTemp = curProcessingLeg.HoldSec;
                                        cdrAppendObj.HoldSec = holdSecTemp;
                                    }

                                    cdrAppendObj.BillSec = curProcessingLeg.BillSec;

                                    if (!cdrAppendObj.ObjType) {
                                        cdrAppendObj.ObjType = curProcessingLeg.ObjType;
                                    }

                                    if (!cdrAppendObj.ObjCategory) {
                                        cdrAppendObj.ObjCategory = curProcessingLeg.ObjCategory;
                                    }

                                    outLegProcessed = true;

                                    if (!outLegAnswered) {
                                        if (curProcessingLeg.BillSec > 0) {
                                            outLegAnswered = true;
                                        }
                                    }
                                }


                                if (callHangupDirectionA === 'recv_bye') {
                                    cdrAppendObj.HangupParty = 'CALLER';
                                }
                                else if (callHangupDirectionB === 'recv_bye') {
                                    cdrAppendObj.HangupParty = 'CALLEE';
                                }
                                else {
                                    cdrAppendObj.HangupParty = 'SYSTEM';
                                }


                                cdrAppendObj.IsAnswered = outLegAnswered;

                                if (outLegProcessed && cdrAppendObj.BillSec) {
                                    cdrAppendObj.ShowButton = true;
                                }

                                cdrAppendObj.BillSec = convertToMMSS(cdrAppendObj.BillSec);
                                cdrAppendObj.Duration = convertToMMSS(cdrAppendObj.Duration);
                                cdrAppendObj.AnswerSec = convertToMMSS(cdrAppendObj.AnswerSec);
                                cdrAppendObj.QueueSec = convertToMMSS(cdrAppendObj.QueueSec);
                                cdrAppendObj.HoldSec = convertToMMSS(cdrAppendObj.HoldSec);

                                var cdrCsv =
                                {
                                    DVPCallDirection: cdrAppendObj.DVPCallDirection,
                                    SipFromUser: cdrAppendObj.SipFromUser,
                                    SipToUser: cdrAppendObj.SipToUser,
                                    AgentSkill: cdrAppendObj.AgentSkill,
                                    CreatedTime: cdrAppendObj.CreatedTime,
                                    Duration: cdrAppendObj.Duration,
                                    AnswerSec: cdrAppendObj.AnswerSec,
                                    QueueSec: cdrAppendObj.QueueSec,
                                    ObjType: cdrAppendObj.ObjType,
                                    ObjCategory: cdrAppendObj.ObjCategory
                                };


                                cdrListForCSV.push(cdrCsv);
                            }


                        }
                        else {
                            $scope.showAlert('Info', 'info', 'No records to load');

                        }


                    }
                    else {
                        $scope.showAlert('Error', 'error', 'Error occurred while loading cdr list');
                    }

                    deferred.resolve(cdrListForCSV);


                }, function (err) {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading cdr list');
                    deferred.resolve(cdrListForCSV);
                })
            }
            catch (ex) {
                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading cdr list')
                deferred.resolve(cdrListForCSV);
            }

            return deferred.promise;
        };


        $scope.getProcessedCDR = function (offset, reset) {
            $scope.enableSearchButton = false;

            try {
                if (reset) {
                    pageStack = [];
                    $scope.top = -1;
                    $scope.bottom = -1;
                    pageInfo.top = -1;
                    pageInfo.bottom = -1;
                }


                $scope.isNextDisabled = true;
                $scope.isPreviousDisabled = true;


                var momentTz = moment.parseZone(new Date()).format('Z');
                //var encodedTz = encodeURI(momentTz);
                momentTz = momentTz.replace("+", "%2B");

                var st = moment($scope.startTimeNow, ["h:mm A"]).format("HH:mm");
                var et = moment($scope.endTimeNow, ["h:mm A"]).format("HH:mm");

                var startDate = $scope.startDate + ' ' + st + ':00' + momentTz;
                var endDate = $scope.endDate + ' ' + et + ':59' + momentTz;

                if (!$scope.timeEnabledStatus) {
                    startDate = $scope.startDate + ' 00:00:00' + momentTz;
                    endDate = $scope.endDate + ' 23:59:59' + momentTz;
                }

                var lim = parseInt($scope.recLimit);
                $scope.isTableLoading = 0;
                cdrApiHandler.getAbandonCDRForTimeRange(startDate, endDate, lim, offset, $scope.agentFilter, $scope.skillFilter, $scope.custFilter).then(function (cdrResp) {
                    if (!cdrResp.Exception && cdrResp.IsSuccess && cdrResp.Result) {
                        if (!isEmpty(cdrResp.Result)) {

                            $scope.cdrList = [];
                            var topSet = false;
                            var bottomSet = false;

                            var count = 0;
                            var cdrLen = Object.keys(cdrResp.Result).length;

                            for (cdr in cdrResp.Result) {
                                count++;
                                var cdrAppendObj = {};
                                var outLegProcessed = false;
                                var curCdr = cdrResp.Result[cdr];
                                var isInboundHTTAPI = false;
                                var outLegAnswered = false;

                                var callHangupDirectionA = '';
                                var callHangupDirectionB = '';

                                var len = curCdr.length;


                                //Need to filter out inbound and outbound legs before processing

                                var filteredInb = curCdr.filter(function (item) {
                                    if (item.Direction === 'inbound') {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }

                                });

                                var filteredOutb = curCdr.filter(function (item) {
                                    if (item.Direction === 'outbound') {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }

                                });


                                //process inbound legs first

                                for (i = 0; i < filteredInb.length; i++) {
                                    var curProcessingLeg = filteredInb[i];

                                    if (curProcessingLeg.DVPCallDirection) {
                                        callHangupDirectionA = curProcessingLeg.HangupDisposition;
                                    }


                                    //use the counts in inbound leg
                                    if (!topSet) {
                                        $scope.top = curProcessingLeg.id;
                                        topSet = true;
                                    }

                                    if (!bottomSet && count === cdrLen) {
                                        $scope.bottom = curProcessingLeg.id;
                                        bottomSet = true;
                                    }

                                    cdrAppendObj.Uuid = curProcessingLeg.Uuid;
                                    cdrAppendObj.SipFromUser = curProcessingLeg.SipFromUser;
                                    cdrAppendObj.SipToUser = curProcessingLeg.SipToUser;
                                    cdrAppendObj.IsAnswered = false;

                                    cdrAppendObj.HangupCause = curProcessingLeg.HangupCause;

                                    var localTime = moment(curProcessingLeg.CreatedTime).local().format("YYYY-MM-DD HH:mm:ss");

                                    cdrAppendObj.CreatedTime = localTime;
                                    cdrAppendObj.Duration = curProcessingLeg.Duration;
                                    cdrAppendObj.BillSec = 0;
                                    cdrAppendObj.HoldSec = 0;

                                    cdrAppendObj.DVPCallDirection = curProcessingLeg.DVPCallDirection;

                                    if (cdrAppendObj.DVPCallDirection === 'inbound') {
                                        var holdSecTemp = curProcessingLeg.HoldSec + curProcessingLeg.WaitSec;
                                        cdrAppendObj.HoldSec = holdSecTemp;
                                    }


                                    cdrAppendObj.QueueSec = curProcessingLeg.QueueSec;
                                    cdrAppendObj.AgentSkill = curProcessingLeg.AgentSkill;


                                    cdrAppendObj.AnswerSec = curProcessingLeg.AnswerSec;


                                    if (curProcessingLeg.ObjType === 'HTTAPI') {
                                        isInboundHTTAPI = true;
                                    }

                                    cdrAppendObj.ObjType = curProcessingLeg.ObjType;
                                    cdrAppendObj.ObjCategory = curProcessingLeg.ObjCategory;


                                }

                                //process outbound legs next

                                var curProcessingLeg = null;

                                if (filteredOutb && filteredOutb.length > 0) {
                                    curProcessingLeg = filteredOutb[0];
                                }

                                if (curProcessingLeg) {
                                    callHangupDirectionB = curProcessingLeg.HangupDisposition;

                                    if (!bottomSet && count === cdrLen) {
                                        $scope.bottom = curProcessingLeg.id;
                                        bottomSet = true;
                                    }

                                    cdrAppendObj.RecievedBy = curProcessingLeg.SipToUser;

                                    cdrAppendObj.AnswerSec = curProcessingLeg.AnswerSec;


                                    if (cdrAppendObj.DVPCallDirection === 'outbound') {
                                        var holdSecTemp = curProcessingLeg.HoldSec;
                                        cdrAppendObj.HoldSec = holdSecTemp;
                                    }

                                    cdrAppendObj.BillSec = curProcessingLeg.BillSec;

                                    if (!cdrAppendObj.ObjType) {
                                        cdrAppendObj.ObjType = curProcessingLeg.ObjType;
                                    }

                                    if (!cdrAppendObj.ObjCategory) {
                                        cdrAppendObj.ObjCategory = curProcessingLeg.ObjCategory;
                                    }

                                    outLegProcessed = true;

                                    if (!outLegAnswered) {
                                        if (curProcessingLeg.BillSec > 0) {
                                            outLegAnswered = true;
                                        }
                                    }
                                }


                                if (callHangupDirectionA === 'recv_bye') {
                                    cdrAppendObj.HangupParty = 'CALLER';
                                }
                                else if (callHangupDirectionB === 'recv_bye') {
                                    cdrAppendObj.HangupParty = 'CALLEE';
                                }
                                else {
                                    cdrAppendObj.HangupParty = 'SYSTEM';
                                }


                                cdrAppendObj.IsAnswered = outLegAnswered;

                                if (outLegProcessed && cdrAppendObj.BillSec) {
                                    cdrAppendObj.ShowButton = true;
                                }

                                cdrAppendObj.BillSec = convertToMMSS(cdrAppendObj.BillSec);
                                cdrAppendObj.Duration = convertToMMSS(cdrAppendObj.Duration);
                                cdrAppendObj.AnswerSec = convertToMMSS(cdrAppendObj.AnswerSec);
                                cdrAppendObj.QueueSec = convertToMMSS(cdrAppendObj.QueueSec);
                                cdrAppendObj.HoldSec = convertToMMSS(cdrAppendObj.HoldSec);


                                $scope.cdrList.push(cdrAppendObj);


                            }

                            if (pageStack.length === 0) {
                                $scope.isNextDisabled = false;
                                $scope.isPreviousDisabled = true;
                            }
                            else if (pageStack.length > 0) {
                                $scope.isPreviousDisabled = false;
                                $scope.isNextDisabled = false;
                            }

                            $scope.isTableLoading = 1;
                        }
                        else {
                            $scope.showAlert('Info', 'info', 'No records to load');

                            if(offset === 0)
                            {
                                $scope.cdrList = [];
                            }

                            if (pageStack.length > 0) {
                                $scope.isPreviousDisabled = false;
                                $scope.isNextDisabled = true;
                            }
                            $scope.isNextDisabled = true;
                            $scope.isTableLoading = 1;
                        }


                    }
                    else {
                        $scope.showAlert('Error', 'error', 'Error occurred while loading cdr list');
                        $scope.isTableLoading = 1;
                    }

                    $scope.enableSearchButton = true;


                }, function (err) {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading cdr list');
                    $scope.isTableLoading = 1;
                    $scope.enableSearchButton = true;
                })
            }
            catch (ex) {
                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading cdr list');
                $scope.isTableLoading = 1;
            }
        }


    };
    app.controller("abandonCallCdrCtrl", abandonCallCdrCtrl);

}());


