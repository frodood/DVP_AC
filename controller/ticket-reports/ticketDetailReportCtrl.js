/**
 * Created by dinusha on 9/6/2016.
 */
(function () {
    var app = angular.module("veeryConsoleApp");

    var ticketDetailReportCtrl = function ($scope, $filter, $q, $timeout, ticketReportsService, cdrApiHandler, loginService) {

        $scope.showAlert = function (tittle, type, content) {

            new PNotify({
                title: tittle,
                text: content,
                type: type,
                styling: 'bootstrap3'
            });
        };

        $scope.dtOptions = {paging: false, searching: false, info: false, order: [5, 'asc']};

        $scope.tagOrder = ['reference', 'subject', 'phoneNumber', 'email', 'ssn', 'firstname', 'lastname', 'address', 'fromNumber', 'createdDate', 'assignee', 'submitter', 'requester', 'channel', 'status', 'priority', 'type', 'slaViolated'];

        $scope.tagHeaders = ['Reference', 'Subject', 'Phone Number', 'Email', 'SSN', 'First Name', 'Last Name', 'Address', 'From Number', 'Created Date', 'Assignee', 'Submitter', 'Requester', 'Channel', 'Status', 'Priority', 'Type', 'SLA Violated'];

        $scope.moment = moment;

        $scope.pagination = {
            currentPage: 1,
            maxSize: 5,
            totalItems: 0,
            itemsPerPage: 10
        };

        $scope.recLimit = '10';


        $scope.obj = {
            startDay: moment().format("YYYY-MM-DD"),
            endDay: moment().format("YYYY-MM-DD")
        };

        $scope.ticketList = [];
        $scope.extUserList = [];

        $scope.tagList = [];
        $scope.ticketStatusList = [];
        $scope.ticketTypesList = [];

        $scope.cancelDownload = true;
        $scope.buttonClass = 'fa fa-file-text';
        $scope.fileDownloadState = 'RESET';
        $scope.currentCSVFilename = '';
        $scope.DownloadButtonName = 'CSV';

        $scope.pageChanged = function () {
            $scope.getTicketSummary();
        };

        $scope.searchWithNewFilter = function () {
            $scope.pagination.currentPage = 1;
            $scope.FilterData = null;
            $scope.getTicketSummary();
        };


        var isEmpty = function (map) {
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        };

        var getExternalUserList = function () {

            ticketReportsService.getExternalUsers().then(function (extUserList) {
                if (extUserList && extUserList.Result && extUserList.Result.length > 0) {
                    //$scope.extUserList.push.apply($scope.extUserList, extUserList.Result);

                    $scope.extUserList = extUserList.Result.map(function (obj) {
                        var rObj = {
                            UniqueId: obj._id,
                            Display: obj.firstname + ' ' + obj.lastname
                        };

                        return rObj;
                    });


                    /*$scope.extUserList.push({name: 'sukitha', age:'rrr'});
                     $scope.extUserList.push({name: 'ddd', age:'eee'});
                     $scope.extUserList.push({name: 'eeee', age:'rrrs'});*/
                    //$scope.extUserList = extUserList.Result;
                }


            }).catch(function (err) {
                loginService.isCheckResponse(err);
            });
        };

        var getUserList = function () {

            ticketReportsService.getUsers().then(function (userList) {
                if (userList && userList.Result && userList.Result.length > 0) {
                    //$scope.userList = userList.Result;

                    $scope.userList = userList.Result.map(function (obj) {
                        var rObj = {
                            UniqueId: obj._id,
                            Display: obj.name
                        };

                        return rObj;
                    });
                }


            }).catch(function (err) {
                loginService.isCheckResponse(err);
            });
        };


        var getTagList = function (callback) {
            $scope.tagList = [];
            var tagData = {};
            ticketReportsService.getTagList().then(function (tagList) {
                if (tagList && tagList.Result) {
                    tagData.AllTags = tagList.Result;

                }

                ticketReportsService.getCategoryList().then(function (categoryList) {
                    if (categoryList && categoryList.Result) {
                        tagData.TagCategories = categoryList.Result;
                    }

                    callback(tagData);


                }).catch(function (err) {
                    loginService.isCheckResponse(err);
                    callback(tagData);

                });


            }).catch(function (err) {
                loginService.isCheckResponse(err);
                callback(tagData);
            });
        };

        var getTicketStatusList = function ()
        {

            ticketReportsService.getTicketStatusList().then(function (statusList)
            {
                if (statusList && statusList.Result)
                {
                    $scope.ticketStatusList = statusList.Result;

                }

            }).catch(function (err) {
                loginService.isCheckResponse(err);
            });
        };

        var getTicketTypeList = function ()
        {

            ticketReportsService.getTicketTypeList().then(function (typeList)
            {
                if (typeList && typeList.Result)
                {
                    var tempArr = [];
                    if(typeList.Result.default_types)
                    {
                        tempArr = typeList.Result.default_types;
                    }

                    if(typeList.Result.custom_types)
                    {
                        tempArr = tempArr.concat(typeList.Result.custom_types);
                    }

                    $scope.ticketTypesList = tempArr;

                }

            }).catch(function (err) {
                loginService.isCheckResponse(err);
            });
        };


        var populateToTagList = function () {
            $scope.tagList = [];
            getTagList(function (tagObj) {

                if (tagObj && tagObj.TagCategories) {
                    var newTagCategories = tagObj.TagCategories.map(function (obj) {
                        obj.TagType = 'CATEGORIES';
                        return obj;
                    });

                    $scope.tagList.push.apply($scope.tagList, newTagCategories);

                    console.log($scope.tagList);
                }

                if (tagObj && tagObj.AllTags) {
                    var newAllTags = tagObj.AllTags.map(function (obj) {
                        obj.TagType = 'TAGS';
                        return obj;
                    });

                    $scope.tagList.push.apply($scope.tagList, newAllTags);
                }


            })
        };


        populateToTagList();
        getExternalUserList();
        getUserList();
        getTicketStatusList();
        getTicketTypeList();

        var checkFileReady = function (fileName) {
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
                    $scope.fileDownloadState = 'RESET';
                    $scope.DownloadButtonName = 'CSV';
                    $scope.cancelDownload = true;
                    $scope.buttonClass = 'fa fa-file-text';
                });
            }

        };

        $scope.downloadPress = function () {
            $scope.fileDownloadState = 'RESET';
            $scope.DownloadButtonName = 'CSV';
            $scope.cancelDownload = true;
            $scope.buttonClass = 'fa fa-file-text';
        };


        $scope.getTicketSummary = function ()
        {
            $scope.obj.isTableLoading = 0;

            if (!$scope.FilterData) {
                var slaStatus = $scope.slaStatus ? ($scope.slaStatus === 'true') : null;
                var momentTz = moment.parseZone(new Date()).format('Z');
                momentTz = momentTz.replace("+", "%2B");

                var startDate = $scope.obj.startDay + ' 00:00:00' + momentTz;
                var tempEndDate = $scope.obj.endDay;

                var endDate = moment(tempEndDate).add(1, 'days').format('YYYY-MM-DD') + ' 00:00:00' + momentTz;

                var tagName = null;

                if ($scope.selectedTag) {
                    tagName = $scope.selectedTag.name;
                }

                var limit = parseInt($scope.recLimit);

                $scope.pagination.itemsPerPage = limit;

                $scope.FilterData = {
                    sdate: startDate,
                    edate: endDate,
                    limitCount: limit,
                    skipCount: 0,
                    requester: $scope.selectedExtUser,
                    assignee: $scope.selectedAssignee,
                    submitter: $scope.selectedSubmitter,
                    tag: tagName,
                    channel: $scope.channelType,
                    priority: $scope.priorityType,
                    type: $scope.ticketType,
                    status: $scope.ticketStatus,
                    slaViolated: slaStatus

                }
            }
            else {
                $scope.FilterData.skipCount = ($scope.pagination.currentPage - 1) * $scope.FilterData.limitCount;
            }


            try {

                ticketReportsService.getTicketDetailsCount($scope.FilterData).then(function (ticketCount) {
                    if (ticketCount && ticketCount.IsSuccess) {
                        $scope.pagination.totalItems = ticketCount.Result;
                    }

                    ticketReportsService.getTicketDetails($scope.FilterData).then(function (ticketDetailsResp) {
                        if (ticketDetailsResp && ticketDetailsResp.Result && ticketDetailsResp.Result.length > 0) {

                            $scope.ticketList = ticketDetailsResp.Result;
                            $scope.obj.isTableLoading = 1;

                        }
                        else {
                            $scope.obj.isTableLoading = -1;
                            $scope.ticketList = [];
                        }


                    }).catch(function (err) {
                        loginService.isCheckResponse(err);
                        $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading ticket summary');
                        $scope.obj.isTableLoading = -1;
                        $scope.ticketList = [];
                    });


                }).catch(function (err) {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading ticket summary');
                    $scope.obj.isTableLoading = -1;
                    $scope.ticketList = [];
                });


            }
            catch (ex) {
                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading ticket summary');
                $scope.obj.isTableLoading = -1;
                $scope.ticketList = [];
            }

        };

        $scope.getTicketSummaryCSV = function ()
        {
            $scope.tagHeaders = ['Reference', 'Subject', 'Phone Number', 'Email', 'SSN', 'First Name', 'Last Name', 'Address', 'From Number', 'Created Date', 'Assignee', 'Submitter', 'Requester', 'Channel', 'Status', 'Priority', 'Type', 'SLA Violated'];
            $scope.tagOrder = ['reference', 'subject', 'phoneNumber', 'email', 'ssn', 'firstname', 'lastname', 'address', 'fromNumber', 'createdDate', 'assignee', 'submitter', 'requester', 'channel', 'status', 'priority', 'type', 'slaViolated'];

            if (!$scope.tagCount) {
                $scope.tagCount = 0;
            }

            if ($scope.tagCount) {
                for (j = 0; j < $scope.tagCount; j++) {
                    $scope.tagHeaders.push('Tag' + (j + 1));
                    $scope.tagOrder.push('Tag' + (j + 1));
                }
            }


            $scope.DownloadFileName = 'TICKET_' + $scope.obj.startDay + '_' + $scope.obj.endDay;

            var deferred = $q.defer();

            var ticketListForCSV = [];

            var momentTz = moment.parseZone(new Date()).format('Z');
            momentTz = momentTz.replace("+", "%2B");

            var startDate = $scope.obj.startDay + ' 00:00:00' + momentTz;
            var tempEndDate = $scope.obj.endDay;

            var endDate = moment(tempEndDate).add(1, 'days').format('YYYY-MM-DD') + ' 00:00:00' + momentTz;

            var tagName = null;

            if ($scope.selectedTag) {
                tagName = $scope.selectedTag.name;
            }

            $scope.FilterData = {
                sdate: startDate,
                edate: endDate,
                requester: $scope.selectedExtUser,
                assignee: $scope.selectedAssignee,
                submitter: $scope.selectedSubmitter,
                tag: tagName,
                channel: $scope.channelType,
                priority: $scope.priorityType,
                type: $scope.ticketType,
                status: $scope.ticketStatus,
                slaViolated: $scope.slaStatus

            };


            try {

                ticketReportsService.getTicketDetailsNoPaging($scope.FilterData).then(function (ticketDetailsResp) {
                    if (ticketDetailsResp && ticketDetailsResp.Result && ticketDetailsResp.Result.length > 0) {

                        ticketDetailsResp.Result.forEach(function (ticketInfo) {
                            var ticketInfoTemp =
                            {
                                reference: ticketInfo.reference,
                                subject: ticketInfo.subject,
                                phoneNumber: (ticketInfo.requester ? ticketInfo.requester.phone : ''),
                                email: (ticketInfo.requester ? ticketInfo.requester.email : ''),
                                ssn: (ticketInfo.requester ? ticketInfo.requester.ssn : ''),
                                firstname: (ticketInfo.requester ? ticketInfo.requester.firstname : ''),
                                lastname: (ticketInfo.requester ? ticketInfo.requester.lastname : ''),
                                address: '',
                                fromNumber: (ticketInfo.engagement_session ? ticketInfo.engagement_session.channel_from : ''),
                                createdDate: moment(ticketInfo.created_at).local().format("YYYY-MM-DD HH:mm:ss"),
                                assignee: (ticketInfo.assignee ? ticketInfo.assignee.name : ''),
                                submitter: (ticketInfo.submitter ? ticketInfo.submitter.name : ''),
                                requester: (ticketInfo.requester ? ticketInfo.requester.name : ''),
                                channel: ticketInfo.channel,
                                status: ticketInfo.status,
                                priority: ticketInfo.priority,
                                type: ticketInfo.type,
                                slaViolated: (ticketInfo.ticket_matrix ? ticketInfo.ticket_matrix.sla_violated : false)

                            };

                            if(ticketInfo.requester && ticketInfo.requester.address)
                            {
                                if(ticketInfo.requester.address.number)
                                {
                                    ticketInfoTemp.address = ticketInfoTemp.address + ticketInfo.requester.address.number + ', '
                                }
                                if(ticketInfo.requester.address.street)
                                {
                                    ticketInfoTemp.address = ticketInfoTemp.address + ticketInfo.requester.address.street + ', '
                                }
                                if(ticketInfo.requester.address.city)
                                {
                                    ticketInfoTemp.address = ticketInfoTemp.address + ticketInfo.requester.address.city + ', '
                                }
                                if(ticketInfo.requester.address.province)
                                {
                                    ticketInfoTemp.address = ticketInfoTemp.address + ticketInfo.requester.address.province + ', '
                                }
                                if(ticketInfo.requester.address.country)
                                {
                                    ticketInfoTemp.address = ticketInfoTemp.address + ticketInfo.requester.address.country + ', '
                                }
                            }


                            if (ticketInfo.isolated_tags) {
                                for (i = 0; i < ticketInfo.isolated_tags.length; i++) {
                                    if (i >= $scope.tagCount) {
                                        break;
                                    }
                                    var tagName = 'Tag' + (i + 1);
                                    ticketInfoTemp[tagName] = ticketInfo.isolated_tags[i];
                                }
                            }

                            if(ticketInfo.form_submission && ticketInfo.form_submission.fields)
                            {
                                ticketInfo.form_submission.fields.forEach(function(field)
                                {
                                    if(field.field)
                                    {
                                        var tempFieldName = 'DYNAMICFORM_' + field.field;
                                        if($scope.tagHeaders.indexOf(tempFieldName) < 0)
                                        {
                                            $scope.tagHeaders.push(tempFieldName);
                                            $scope.tagOrder.push(tempFieldName);

                                        }

                                        ticketInfoTemp[tempFieldName] = field.value;

                                    }
                                })
                            }

                            ticketListForCSV.push(ticketInfoTemp);

                        });

                        deferred.resolve(ticketListForCSV);


                    }
                    else {
                        deferred.resolve(ticketListForCSV);
                    }


                }).catch(function (err) {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading ticket summary');
                    deferred.resolve(ticketListForCSV);
                });


            }
            catch (ex) {

                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading ticket summary');
                deferred.resolve(ticketListForCSV);
            }

            return deferred.promise;

        };

        $scope.getTicketSummaryCSVPrepare = function ()
        {
            if ($scope.DownloadButtonName === 'CSV') {
                $scope.cancelDownload = false;
                $scope.buttonClass = 'fa fa-spinner fa-spin';
            }
            else {
                $scope.cancelDownload = true;
                $scope.buttonClass = 'fa fa-file-text';
            }

            $scope.DownloadButtonName = 'PROCESSING';
            $scope.DownloadFileName = 'TICKET_' + $scope.obj.startDay + '_' + $scope.obj.endDay;

            var momentTz = moment.parseZone(new Date()).format('Z');
            momentTz = momentTz.replace("+", "%2B");

            var startDate = $scope.obj.startDay + ' 00:00:00' + momentTz;
            var tempEndDate = $scope.obj.endDay;

            var endDate = moment(tempEndDate).add(1, 'days').format('YYYY-MM-DD') + ' 00:00:00' + momentTz;

            var tagName = null;

            if ($scope.selectedTag) {
                tagName = $scope.selectedTag.name;
            }

            $scope.FilterData = {
                sdate: startDate,
                edate: endDate,
                requester: $scope.selectedExtUser,
                assignee: $scope.selectedAssignee,
                submitter: $scope.selectedSubmitter,
                tag: tagName,
                channel: $scope.channelType,
                priority: $scope.priorityType,
                type: $scope.ticketType,
                status: $scope.ticketStatus,
                slaViolated: $scope.slaStatus,
                tz: momentTz,
                tagCount: $scope.tagCount

            };


            try {

                ticketReportsService.getTicketDetailsNoPaging($scope.FilterData).then(function (ticketDetailsResp) {
                    if (ticketDetailsResp && ticketDetailsResp.Result)
                    {

                        var downloadFilename = ticketDetailsResp.Result;

                        checkFileReady(downloadFilename);


                    }
                    else
                    {
                        $scope.showAlert('Error', 'error', 'Error occurred while loading ticket records');
                        $scope.fileDownloadState = 'RESET';
                        $scope.DownloadButtonName = 'CSV';
                        $scope.cancelDownload = true;
                        $scope.buttonClass = 'fa fa-file-text';
                    }


                }).catch(function (err)
                {
                    loginService.isCheckResponse(err);
                    $scope.showAlert('Error', 'error', 'Error occurred while loading ticket records');
                    $scope.fileDownloadState = 'RESET';
                    $scope.DownloadButtonName = 'CSV';
                    $scope.cancelDownload = true;
                    $scope.buttonClass = 'fa fa-file-text';
                });


            }
            catch (ex) {

                $scope.showAlert('Error', 'error', 'Error occurred');
            }

        };


    };
    app.controller("ticketDetailReportCtrl", ticketDetailReportCtrl);

}());


