/**
 * Created by dinusha on 5/28/2016.
 */

(function () {
    var app = angular.module("veeryConsoleApp");


    var cdrCtrl = function ($scope, $filter, $q, $sce, $timeout, cdrApiHandler, resourceService, sipUserApiHandler, ngAudio,
                            loginService, baseUrls,$anchorScroll,$auth,fileService) {

        $anchorScroll();
        $scope.dtOptions = {paging: false, searching: false, info: false, order: [6, 'desc']};

        $scope.config = {
            preload: "auto",
            tracks: [
                {
                    src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                    kind: "subtitles",
                    srclang: "en",
                    label: "English",
                    default: ""
                }
            ],
            theme: {
                url: "bower_components/videogular-themes-default/videogular.css"
            },
            "analytics": {
                "category": "Videogular",
                "label": "Main",
                "events": {
                    "ready": true,
                    "play": true,
                    "pause": true,
                    "stop": true,
                    "complete": true,
                    "progress": 10
                }
            }
        };


        $scope.enableSearchButton = true;


        $scope.showAlert = function (tittle, type, content) {

            new PNotify({
                title: tittle,
                text: content,
                type: type,
                styling: 'bootstrap3'
            });
        };

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

        $scope.dateValid = function () {
            if ($scope.timeEnabled === 'Date Only') {
                $scope.timeEnabled = 'Date & Time';
                $scope.timeEnabledStatus = true;
            }
            else {
                $scope.timeEnabled = 'Date Only';
                $scope.timeEnabledStatus = false;
            }
        };


        $scope.onDateChange = function () {
            if (moment($scope.startDate, "YYYY-MM-DD").isValid() && moment($scope.endDate, "YYYY-MM-DD").isValid()) {
                $scope.dateValid = true;
            }
            else {
                $scope.dateValid = false;
            }
        };

        $scope.currentPlayingFile = null;

        $scope.hstep = 1;
        $scope.mstep = 15;

        var videogularAPI = null;


        $scope.SetDownloadPath = function (uuid, objType) {
            var decodedToken = loginService.getTokenDecode();

            if (decodedToken && decodedToken.company && decodedToken.tenant) {
                //$scope.DownloadFileUrl = baseUrls.fileServiceUrl + 'File/DownloadLatest/' + uuid + '.mp3?Authorization='+$auth.getToken();

                var fileType = '.mp3';
                if(objType === 'FAX_INBOUND')
                {
                    fileType = '.tif';
                }
                fileService.downloadLatestFile(uuid + fileType)

            }

        };

        $scope.onPlayerReady = function (API) {
            videogularAPI = API;

        };

        $scope.playStopFile = function (uuid) {
            if (videogularAPI) {
                var decodedToken = loginService.getTokenDecode();

                if (decodedToken && decodedToken.company && decodedToken.tenant) {
                    var fileToPlay = baseUrls.fileServiceUrl + 'File/DownloadLatest/'+uuid+'.mp3?Authorization='+$auth.getToken();

                    var arr = [
                        {
                            src: $sce.trustAsResourceUrl(fileToPlay),
                            type: 'audio/mp3'
                        }
                    ];

                    $scope.config.sources = arr;


                    videogularAPI.play();
                }
            }


        };

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

        $scope.startDate = moment().format("YYYY-MM-DD");
        $scope.endDate = moment().format("YYYY-MM-DD");
        $scope.dateValid = true;

        $scope.offset = -1;
        $scope.prevOffset = -1;

        $scope.cancelDownload = true;
        $scope.buttonClass = 'fa fa-file-text';
        $scope.fileDownloadState = 'RESET';
        $scope.currentCSVFilename = '';
        $scope.DownloadButtonName = 'CSV';

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
                        $scope.showAlert('CDR Download', 'warn', 'No CDR Records found for downloading');
                    }

                }).catch(function (err) {
                    $scope.fileDownloadState = 'RESET';
                    $scope.DownloadButtonName = 'CSV';
                    $scope.cancelDownload = true;
                    $scope.buttonClass = 'fa fa-file-text';
                    $scope.showAlert('CDR Download', 'error', 'Error occurred while preparing file');
                });
            }

        };

        $scope.downloadPress = function () {
            $scope.fileDownloadState = 'RESET';
            $scope.DownloadButtonName = 'CSV';
            $scope.cancelDownload = true;
            $scope.buttonClass = 'fa fa-file-text';
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

            $scope.DownloadButtonName = 'PROCESSING';
            $scope.DownloadFileName = 'CDR_' + $scope.startDate + ' ' + $scope.startTimeNow + '_' + $scope.endDate + ' ' + $scope.endTimeNow;

            var deferred = $q.defer();

            var cdrListForCSV = [];

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

            cdrApiHandler.prepareDownloadCDRByType(startDate, endDate, $scope.agentFilter, $scope.skillFilter, $scope.directionFilter, $scope.recFilter, $scope.custFilter, $scope.didFilter, 'csv', momentTz).then(function (cdrResp)
                //cdrApiHandler.getProcessedCDRByFilter(startDate, endDate, $scope.agentFilter, $scope.skillFilter, $scope.directionFilter, $scope.recFilter, $scope.custFilter).then(function (cdrResp)
            {
                if (!cdrResp.Exception && cdrResp.IsSuccess && cdrResp.Result) {
                    /*cdrResp.Result.forEach(function(cdr)
                     {

                     var cdrCsv =
                     {
                     DVPCallDirection: cdr.DVPCallDirection,
                     SipFromUser: cdr.SipFromUser,
                     SipToUser: cdr.SipToUser,
                     RecievedBy: cdr.RecievedBy,
                     AgentSkill: cdr.AgentSkill,
                     IsAnswered: cdr.IsAnswered,
                     CreatedTime: moment(cdr.CreatedTime).local().format("YYYY-MM-DD HH:mm:ss"),
                     Duration: convertToMMSS(cdr.Duration),
                     BillSec: convertToMMSS(cdr.BillSec),
                     AnswerSec: convertToMMSS(cdr.AnswerSec),
                     QueueSec: convertToMMSS(cdr.QueueSec),
                     HoldSec: convertToMMSS(cdr.HoldSec),
                     ObjType: cdr.ObjType,
                     ObjCategory: cdr.ObjCategory,
                     HangupParty: cdr.HangupParty,
                     TransferredParties: cdr.TransferredParties
                     };


                     cdrListForCSV.push(cdrCsv);
                     });*/

                    var downloadFilename = cdrResp.Result;

                    checkFileReady(downloadFilename);
                }
                else {
                    $scope.showAlert('Error', 'error', 'Error occurred while loading cdr records');
                    $scope.fileDownloadState = 'RESET';
                    $scope.DownloadButtonName = 'CSV';
                    $scope.cancelDownload = true;
                    $scope.buttonClass = 'fa fa-file-text';
                }

            }).catch(function (err) {
                loginService.isCheckResponse(err);
                $scope.showAlert('Error', 'error', 'Error occurred while loading cdr records');
                $scope.fileDownloadState = 'RESET';
                $scope.DownloadButtonName = 'CSV';
                $scope.cancelDownload = true;
                $scope.buttonClass = 'fa fa-file-text';
            });

        };


        $scope.getProcessedCDRForCSV = function () {

            $scope.DownloadFileName = 'CDR_' + $scope.startDate + ' ' + $scope.startTimeNow + '_' + $scope.endDate + ' ' + $scope.endTimeNow;

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


                cdrApiHandler.getCDRForTimeRange(startDate, endDate, 0, 0, $scope.agentFilter, $scope.skillFilter, $scope.directionFilter, $scope.recFilter, $scope.custFilter).then(function (cdrResp) {
                    if (!cdrResp.Exception && cdrResp.IsSuccess && cdrResp.Result) {
                        if (!isEmpty(cdrResp.Result)) {
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

                                    if (len === 1) {
                                        cdrAppendObj.ObjType = curProcessingLeg.ObjType;
                                        cdrAppendObj.ObjCategory = curProcessingLeg.ObjCategory;
                                    }


                                }

                                //process outbound legs next

                                var transferredParties = '';

                                var transferCallOriginalCallLeg = null;

                                var transferLegB = filteredOutb.filter(function (item) {
                                    if ((item.ObjType === 'ATT_XFER_USER' || item.ObjType === 'ATT_XFER_GATEWAY') && !item.IsTransferredParty) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }

                                });

                                var actualTransferLegs = filteredOutb.filter(function (item) {
                                    if (item.IsTransferredParty) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }

                                });

                                if (transferLegB && transferLegB.length > 0) {
                                    transferCallOriginalCallLeg = transferLegB[0];
                                }


                                if (transferCallOriginalCallLeg) {
                                    cdrAppendObj.SipFromUser = transferCallOriginalCallLeg.SipFromUser;
                                    cdrAppendObj.RecievedBy = transferCallOriginalCallLeg.SipToUser;
                                    callHangupDirectionB = transferCallOriginalCallLeg.HangupDisposition;

                                    cdrAppendObj.AnswerSec = transferCallOriginalCallLeg.AnswerSec;

                                    cdrAppendObj.BillSec = transferCallOriginalCallLeg.BillSec;

                                    if (!cdrAppendObj.ObjType) {
                                        cdrAppendObj.ObjType = transferCallOriginalCallLeg.ObjType;
                                    }

                                    if (!cdrAppendObj.ObjCategory) {
                                        cdrAppendObj.ObjCategory = transferCallOriginalCallLeg.ObjCategory;
                                    }

                                    outLegProcessed = true;

                                    if (!outLegAnswered) {
                                        if (curProcessingLeg.BillSec > 0) {
                                            outLegAnswered = true;
                                        }
                                    }

                                    for (k = 0; k < actualTransferLegs.length; k++) {
                                        transferredParties = transferredParties + actualTransferLegs[k].SipToUser + ',';
                                    }
                                }
                                else {
                                    var connectedLegs = filteredOutb.filter(function (item) {
                                        if (item.IsAnswered) {
                                            return true;
                                        }
                                        else {
                                            return false;
                                        }

                                    });

                                    var curProcessingLeg = null;

                                    if (connectedLegs && connectedLegs.length > 0) {
                                        curProcessingLeg = connectedLegs[0];

                                    }
                                    else {
                                        if (filteredOutb && filteredOutb.length > 0) {
                                            curProcessingLeg = filteredOutb[0];
                                        }

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

                                if (transferredParties) {
                                    transferredParties = transferredParties.slice(0, -1);
                                    cdrAppendObj.TransferredParties = transferredParties;
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
                                    RecievedBy: cdrAppendObj.RecievedBy,
                                    AgentSkill: cdrAppendObj.AgentSkill,
                                    IsAnswered: cdrAppendObj.IsAnswered,
                                    CreatedTime: cdrAppendObj.CreatedTime,
                                    Duration: cdrAppendObj.Duration,
                                    BillSec: cdrAppendObj.BillSec,
                                    AnswerSec: cdrAppendObj.AnswerSec,
                                    QueueSec: cdrAppendObj.QueueSec,
                                    HoldSec: cdrAppendObj.HoldSec,
                                    ObjType: cdrAppendObj.ObjType,
                                    ObjCategory: cdrAppendObj.ObjCategory,
                                    HangupParty: cdrAppendObj.HangupParty,
                                    TransferredParties: cdrAppendObj.TransferredParties
                                };


                                cdrListForCSV.push(cdrCsv);
                            }


                        }
                        else {
                            $scope.showAlert('Info', 'info', 'No records to load');

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





                /*var startDateMoment = moment($scope.startDate, "YYYY-MM-DD");
                 var endDateMoment = moment($scope.endDate, "YYYY-MM-DD");*/

                /*var startYear = startDateMoment.year().toString();
                 var startMonth = (startDateMoment.month() + 1).toString();
                 var startDay = startDateMoment.date().toString();

                 var endYear = endDateMoment.year().toString();
                 var endMonth = (endDateMoment.month() + 1).toString();
                 var endDay = endDateMoment.date().toString();*/

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

                /*var startTime = startYear + '-' + startMonth + '-' + startDay + ' ' + $scope.startTimeNow + ':00' + momentTz;
                 var endTime = endYear + '-' + endMonth + '-' + endDay + ' ' + $scope.endTimeNow + ':59' + momentTz;

                 if ($scope.startTimeNow === '00:00' && $scope.endTimeNow === '00:00')
                 {
                 //use date only
                 startTime = startYear + '-' + startMonth + '-' + startDay + ' 00:00:00' + momentTz;
                 endTime = endYear + '-' + endMonth + '-' + endDay + ' 23:59:59' + momentTz;
                 }*/


                var lim = parseInt($scope.recLimit);
                $scope.isTableLoading = 0;
                cdrApiHandler.getCDRForTimeRange(startDate, endDate, lim, offset, $scope.agentFilter, $scope.skillFilter, $scope.directionFilter, $scope.recFilter, $scope.custFilter, $scope.didFilter).then(function (cdrResp) {
                    if (!cdrResp.Exception && cdrResp.IsSuccess && cdrResp.Result) {
                        if (!isEmpty(cdrResp.Result)) {

                            $scope.cdrList = [];

                            var topSet = false;
                            var bottomSet = false;

                            var count = 0;
                            var cdrLen = Object.keys(cdrResp.Result).length;

                            for (cdr in cdrResp.Result)
                            {
                                count++;
                                var cdrAppendObj = {};
                                var outLegProcessed = false;
                                var curCdr = cdrResp.Result[cdr];
                                var isInboundHTTAPI = false;
                                var outLegAnswered = false;
                                var inLegAnswered = false;

                                var callHangupDirectionA = '';
                                var callHangupDirectionB = '';

                                var len = curCdr.length;

                                var callCategory = '';


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
                                var holdSecTemp = 0;

                                for (i = 0; i < filteredInb.length; i++) {
                                    var curProcessingLeg = filteredInb[i];

                                    callCategory = curProcessingLeg.ObjCategory;

                                    if (curProcessingLeg.DVPCallDirection)
                                    {
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
                                    inLegAnswered = curProcessingLeg.IsAnswered;

                                    cdrAppendObj.HangupCause = curProcessingLeg.HangupCause;

                                    var localTime = moment(curProcessingLeg.CreatedTime).local().format("YYYY-MM-DD HH:mm:ss");

                                    cdrAppendObj.CreatedTime = localTime;
                                    cdrAppendObj.Duration = curProcessingLeg.Duration;
                                    cdrAppendObj.BillSec = 0;
                                    cdrAppendObj.HoldSec = 0;

                                    cdrAppendObj.DVPCallDirection = curProcessingLeg.DVPCallDirection;

                                    /*if (cdrAppendObj.DVPCallDirection === 'inbound') {
                                        holdSecTemp = holdSecTemp + curProcessingLeg.HoldSec;
                                        cdrAppendObj.HoldSec = holdSecTemp;
                                    }*/

                                    holdSecTemp = holdSecTemp + curProcessingLeg.HoldSec;
                                    cdrAppendObj.HoldSec = holdSecTemp;


                                    cdrAppendObj.QueueSec = curProcessingLeg.QueueSec;
                                    cdrAppendObj.AgentSkill = curProcessingLeg.AgentSkill;


                                    cdrAppendObj.AnswerSec = curProcessingLeg.AnswerSec;


                                    if (curProcessingLeg.ObjType === 'HTTAPI') {
                                        isInboundHTTAPI = true;

                                        if (len === 1) {
                                            cdrAppendObj.ObjType = curProcessingLeg.ObjType;
                                            cdrAppendObj.ObjCategory = curProcessingLeg.ObjCategory;
                                        }
                                    }
                                    else
                                    {
                                        cdrAppendObj.ObjType = curProcessingLeg.ObjType;
                                        cdrAppendObj.ObjCategory = curProcessingLeg.ObjCategory;
                                    }


                                }

                                //process outbound legs next

                                var transferredParties = '';

                                var transferCallOriginalCallLeg = null;

                                var transferLegB = filteredOutb.filter(function (item) {
                                    if ((item.ObjType === 'ATT_XFER_USER' || item.ObjType === 'ATT_XFER_GATEWAY') && !item.IsTransferredParty) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }

                                });

                                var actualTransferLegs = filteredOutb.filter(function (item) {
                                    if (item.IsTransferredParty) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }

                                });

                                if (transferLegB && transferLegB.length > 0)
                                {
                                    var transferLegBAnswered = filteredOutb.filter(function (item) {
                                        return item.IsAnswered === true;
                                    });

                                    if(transferLegBAnswered && transferLegBAnswered.length > 0)
                                    {
                                        transferCallOriginalCallLeg = transferLegBAnswered[0];
                                    }
                                    else
                                    {
                                        transferCallOriginalCallLeg = transferLegB[0];
                                    }

                                }

                                if (transferCallOriginalCallLeg) {
                                    cdrAppendObj.SipFromUser = transferCallOriginalCallLeg.SipFromUser;
                                    cdrAppendObj.RecievedBy = transferCallOriginalCallLeg.SipToUser;
                                    callHangupDirectionB = transferCallOriginalCallLeg.HangupDisposition;

                                    if (!bottomSet && count === cdrLen) {
                                        $scope.bottom = transferCallOriginalCallLeg.id;
                                        bottomSet = true;
                                    }

                                    cdrAppendObj.AnswerSec = transferCallOriginalCallLeg.AnswerSec;

                                    cdrAppendObj.BillSec = transferCallOriginalCallLeg.BillSec;

                                    if (!cdrAppendObj.ObjType) {
                                        cdrAppendObj.ObjType = transferCallOriginalCallLeg.ObjType;
                                    }

                                    if (!cdrAppendObj.ObjCategory) {
                                        cdrAppendObj.ObjCategory = transferCallOriginalCallLeg.ObjCategory;
                                    }

                                    outLegProcessed = true;

                                    if (!outLegAnswered) {
                                        if (curProcessingLeg.BillSec > 0) {
                                            outLegAnswered = true;
                                        }
                                    }

                                    for (k = 0; k < actualTransferLegs.length; k++) {
                                        transferredParties = transferredParties + actualTransferLegs[k].SipToUser + ',';
                                    }
                                }
                                else
                                {
                                    var connectedLegs = filteredOutb.filter(function (item) {
                                        if (item.IsAnswered) {
                                            return true;
                                        }
                                        else {
                                            return false;
                                        }

                                    });

                                    var curProcessingLeg = null;

                                    if (connectedLegs && connectedLegs.length > 0) {
                                        curProcessingLeg = connectedLegs[0];

                                    }
                                    else {
                                        if (filteredOutb && filteredOutb.length > 0) {
                                            curProcessingLeg = filteredOutb[0];
                                        }

                                    }

                                    if(callCategory === 'FOLLOW_ME' || callCategory === 'FORWARDING')
                                    {
                                        for (k = 0; k < filteredOutb.length; k++) {
                                            transferredParties = transferredParties + filteredOutb[k].SipToUser + ',';
                                        }

                                    }

                                    if (curProcessingLeg)
                                    {
                                        callHangupDirectionB = curProcessingLeg.HangupDisposition;

                                        if (!bottomSet && count === cdrLen) {
                                            $scope.bottom = curProcessingLeg.id;
                                            bottomSet = true;
                                        }

                                        cdrAppendObj.RecievedBy = curProcessingLeg.SipToUser;

                                        cdrAppendObj.AnswerSec = curProcessingLeg.AnswerSec;

                                        holdSecTemp = holdSecTemp + curProcessingLeg.HoldSec;
                                        cdrAppendObj.HoldSec = holdSecTemp;


                                        if (cdrAppendObj.DVPCallDirection === 'outbound') {

                                            cdrAppendObj.Uuid = curProcessingLeg.Uuid;
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

                                if (transferredParties) {
                                    transferredParties = transferredParties.slice(0, -1);
                                    cdrAppendObj.TransferredParties = transferredParties;
                                }

                                if(cdrAppendObj.ObjType === 'FAX_INBOUND')
                                {
                                    cdrAppendObj.IsAnswered = inLegAnswered;

                                    if(inLegAnswered)
                                    {
                                        cdrAppendObj.ShowButton = true;
                                    }
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
    app.controller("cdrCtrl", cdrCtrl);

}());


