/**
 * Created by Damith on 5/28/2016.
 */

'use strict';
mainApp.controller('mainCtrl', function ($scope, $rootScope, $state, $timeout, $filter, $uibModal, jwtHelper, loginService,
                                         authService, notifiSenderService, veeryNotification, $q, userImageList, userProfileApiAccess, myUserProfileApiAccess, turnServers, callMonitorSrv, subscribeServices) {


    //added by pawan

    $scope.CallStatus = null;
    $scope.loginData = {};
    $scope.callListStatus = false;
    $scope.isRegistered = true;
    $scope.inCall = false;

    $scope.newNotifications = [];


// Register for notifications

    $scope.showAlert = function (tittle, type, msg) {
        new PNotify({
            title: tittle,
            text: msg,
            type: type,
            styling: 'bootstrap3',
            icon: false
        });
    };
    $scope.unredNotifications = 0;
    $scope.OnMessage = function (data) {

        if (data.From && $scope.users) {

            var sender = $filter('filter')($scope.users, {username: data.From});
            console.log("Sender ", sender);
            data.avatar = (sender && sender.length) ? sender[0].avatar : "assets/images/defaultProfile.png";
            data.resv_time = new Date();
            data.read = false;
            $scope.newNotifications.unshift(data);
            $scope.unredNotifications = $scope.newNotifications.length;
            var audio = new Audio("assets/sounds/notification-1.mp3");
            audio.play();
        }


        //$scope.showAlert("Success","success","Got");
        //console.log(data);


    };


    /*$scope.getCountOfUnredNotifications = function () {
     return filterFilter($scope.notifications, {read: false}).length;
     };*/

    //---------------------- Notification Service  ------------------------------ //

    $scope.isSocketRegistered = false;
    $scope.isLoadingNotifiReg = false;


    $scope.agentDisconnected = function () {
        $scope.isSocketRegistered = false;
        $scope.showAlert("Registration failed", "error", "Disconnected from notifications, Please re-register")
    };
    $scope.agentAuthenticated = function () {
        $scope.isSocketRegistered = true;
        $('#regNotificationLoading').addClass('display-none').removeClass('display-block');
        $('#regNotification').addClass('display-block').removeClass('display-none');
    };
    $scope.callMonitorRegistered = function () {
        $scope.isSocketRegistered = true;

    };


    $scope.veeryNotification = function () {
        /*veeryNotification.connectToServer(authService.TokenWithoutBearer(), baseUrls.notification, notificationEvent);*/

        subscribeServices.connectSubscribeServer(function (isConnected) {

            if (isConnected) {
                $scope.agentAuthenticated();
            } else {
                $scope.agentDisconnected();
            }
        });
    };

    $scope.veeryNotification();

    $scope.socketReconnect = function () {
        subscribeServices.connectSubscribeServer(function (isConnected) {

            if (isConnected) {
                $scope.agentAuthenticated();
            } else {
                $scope.agentDisconnected();
            }
        });
    };


    $scope.checkAndRegister = function () {


        if (!$scope.isSocketRegistered) {
            $('#regNotification').addClass('display-none').removeClass('display-block');
            $('#regNotificationLoading').addClass('display-block').removeClass('display-none');
            $scope.isLoadingNotifiReg = true;
            $scope.socketReconnect();
        }

    };


    subscribeServices.SubscribeEvents(function (event, data) {
        switch (event) {

            /*case 'agent_connected':

             $scope.agentConnected(data);

             break;

             case 'agent_disconnected':

             $scope.agentDisconnected(data);

             break;

             case 'agent_found':

             $scope.agentFound(data);

             break;

             case 'agent_rejected':
             $scope.agentRejected(data);
             break;

             case 'todo_reminder':

             $scope.todoRemind(data);

             break;

             case 'notice':

             $scope.OnMessage(data);

             break;
             */
            case 'notice_message':

                $scope.OnMessage(data);

                break;
        }
    });

    subscribeServices.SubscribeStatus(function (status) {
        if (status) {
            Object.keys(status).forEach(function (key, index) {

                $scope.users.map(function (item) {
                    if (item.username === key) {
                        item.status = status[key];
                        item.statusTime = Date.now();
                    }
                });

                /*var userObj = $scope.users.filter(function (item) {
                 return key === item.username;
                 });
                 if (Array.isArray(userObj)) {
                 userObj.forEach(function (obj, index) {
                 obj.status = status[key];
                 obj.statusTime = Date.now();
                 });
                 }*/

            });

            $scope.users.sort(function (a, b) {

                var i = 0;
                var j = 0;


                if (a.status == 'offline') {

                    i = 1;
                } else {

                    i = 2;
                }

                if (b.status == 'offline') {

                    j = 1;
                } else {

                    j = 2;
                }


                return j - i;

            });
        }
    });


    subscribeServices.SubscribeCallStatus(function (status) {
        if (status) {
            Object.keys(status).forEach(function (key, index) {
                var userObj = $scope.users.filter(function (item) {
                    return key == item.username;
                });
                if (Array.isArray(userObj)) {
                    userObj.forEach(function (obj, index) {

                        obj.callstatus = status[key];
                        obj.callstatusstyle = 'call-status-' + obj.callstatus;
                        obj.callstatusTime = Date.now();
                    });
                }

            });
        }
    });

    subscribeServices.subscribeDashboard(function (event) {
        switch (event.roomName) {
            case 'ARDS:break_exceeded':
            case 'ARDS:freeze_exceeded':
                if (event.Message) {
                    if(event.Message.SessionId){
                        event.Message.Message = event.Message.Message +" Session : "+event.Message.SessionId;
                    }
                    var data = {};
                    angular.copy(event, data);
                    var mObject = data.Message;

                    //var items = $filter('filter')($scope.users, {resourceid: parseInt(mObject.ResourceId)}, true);
                    var items = $filter('filter')($scope.users, {resourceid: mObject.ResourceId.toString()});
                    mObject.From = (items&&items.length)?items[0].username : mObject.UserName;
                    mObject.TopicKey = data.eventName;
                    mObject.messageType = mObject.Message;
                    mObject.header = mObject.Message;
                    mObject.isPersistMessage = mObject.Direction !== "STATELESS";
                    mObject.PersistMessageID = mObject.id;
                    $scope.OnMessage(mObject);
                }
                break;
            default:
                //console.log(event);
                break;

        }
    });

    //---------------------- Notification Service End ------------------------------ //

    //check my navigation
    //is can access
    loginService.getNavigationAccess(function (result) {
        $scope.accessNavigation = result;
        //if($scope.accessNavigation.BASIC INFO)
        if ($scope.accessNavigation.TICKET) {
            $scope.loadUserGroups();
            $scope.loadUsers();
        }
    });


    $scope.clickDirective = {
        goLogout: function () {
            loginService.Logoff(undefined, function (issuccess) {
                if (issuccess) {
                    $state.go('login');
                    veeryNotification.disconnectFromServer();

                    /*$timeout.cancel(getAllRealTimeTimer);*/
                } else {

                }

            });
            //loginService.clearCookie("@loginToken");
            //$state.go('login');
        },
        goDashboard: function () {
            $state.go('console.dashboard');
        },
        goProductivity: function () {
            $state.go('console.productivity');
        },
        goFilegallery: function () {
            $state.go('console.filegallery');
        },
        goAgentDial: function () {
            $state.go('console.AgentDialer');
        },
        goFileupload: function () {
            $state.go('console.fileupload');
        },
        goAttributeList: function () {
            $state.go('console.attributes');
        },
        goFacebookApp: function () {
            $state.go('console.facebook');
        },
        goTwitterApp: function () {
            $state.go('console.twitter');
        },
        goEmailApp: function () {
            $state.go('console.email');
        },
        goResourceList: function () {
            $state.go('console.resources');
        },
        goRealTimeQueued: function () {
            $state.go('console.realtime-queued');
        },
        goCdrReport: function () {
            $state.go('console.cdr');
        },
        goCallMonitor: function () {
            $state.go('console.callmonitor');
        },
        goSipUser: function () {
            $state.go('console.sipuser');
        },
        goUsers: function () {
            $state.go('console.users');
        },
        goPbxUsers: function () {
            $state.go('console.pbxuser');
        },
        goPbxAdmin: function () {
            $state.go('console.pbxadmin');
        },

        goAutoAttendance: function () {
            $state.go('console.autoattendance');
        },

        goEditAutoAttendance: function () {
            $state.go('console.editautoattendance');
        },

        goNewAutoAttendance: function () {
            $state.go('console.newautoattendance');
        },

        goMyNumbers: function () {
            $state.go('console.myNumbers');
        },
        goRingGroup: function () {
            $state.go('console.ringGroup');
        },
        GoApplicationAccessManager: function () {
            $state.go('console.applicationAccessManager');
        },
        goDynamicForm: function () {
            $state.go('console.FormDesign');
        },
        goPackages: function () {
            $state.go('console.pricing');
        }, goCredit: function () {
            $state.go('console.credit');
        },
        goAgentStatus: function () {
            $state.go('console.AgentStatus');
        },
        goAgentProfileSummary: function () {
            $state.go('console.AgentProfileSummary');
        },
        goRule: function () {
            $state.go('console.rule');
        },
        goAbandonCallList: function () {
            $state.go('console.abandonCdr');
        },
        goApplications: function () {
            $state.go('console.application');
        },
        goHoldMusic: function () {
            $state.go('console.holdmusic');
        },
        goLimits: function () {
            $state.go('console.limits');
        },
        goConference: function () {
            $state.go('console.conference');
        },
        /*goConferenceMonitor: function () {
         $state.go('console.conferencemonitor');
         },*/
        goQueueSummary: function () {
            $state.go('console.queuesummary');
        },
        goQueueHourlySummary: function () {
            $state.go('console.queueHourlySummary');
        },
        goAgentSummary: function () {
            $state.go('console.agentsummary');
        },
        goArdsConfig: function () {
            $state.go('console.ardsconfig');
        },

        goProfile: function () {
            $state.go('console.myprofile');
        },

        goExtension: function () {
            $state.go('console.extension');
        },
        goDID: function () {
            $state.go('console.did');
        },
        goSchedule: function () {
            $state.go('console.scheduler');
        },
        goReportMail: function () {
            $state.go('console.reportMail');
        },
        goCompanyConfig: function () {
            $state.go('console.companyconfig');
        },
        goTranslations: function () {
            $state.go('console.translations');
        },
        goTicketTrigger: function () {
            $state.go('console.trigger');
        },
        goTemplateCreater: function () {
            $state.go('console.templatecreater');
        },
        goTriggerConfiguration: function () {
            $state.go('console.trigger.triggerConfiguration');
        },
        goTagManager: function () {
            $state.go('console.tagmanager');
        },
        goCallSummary: function () {
            $state.go('console.callsummary');
        },
        goTicketSla: function () {
            $state.go('console.sla');
        },
        goQABuilder: function () {
            $state.go('console.qaRatingFormBuilder');
        },
        goCreateCampaign: function () {
            $state.go('console.campaign')
        },
        goCampaignMonitor: function () {
            $state.go('console.campaignmonitor')
        },
        goCampaignSummery: function () {
            $state.go('console.campaignsummeryreport')
        },
        goCampaignDisposition: function () {
            $state.go('console.campaigndispositionreport')
        },
        goCampaignAttempt: function () {
            $state.go('console.campaignattemptreport')
        },
        goAgentDialerSummery: function () {
            $state.go('console.AgentDialerSummary')
        },
        goAgentDialerDetails: function () {
            $state.go('console.AgentDialerDetails')
        },
        goZoho: function () {
            $state.go('console.zoho')
        },
        goZohoUser: function () {
            $state.go('console.zohousers')
        },
        goCampaignCallback: function () {
            $state.go('console.campaigncallbackreport')
        },
        goQASubmission: function () {
            $state.go('console.qaSubmission');
        },
        goAgentStatusEvt: function () {
            $state.go('console.agentstatusevents');
        },
        goTickerAgentDashboard: function () {
            $state.go('console.agentTicketDashboard');
        },
        goTicketSummary: function () {
            $state.go('console.ticketSummary');
        },
        goTicketTagSummary: function () {
            $state.go('console.ticketTagSummary');
        },
        goAuditTrailReport: function () {
            $state.go('console.auditTrailRep');
        },
        goTicketDetailReport: function () {
            $state.go('console.ticketDetailReport');
        },
        goTimeSheet: function () {
            $state.go('console.timeSheet');
        }, goFilter: function () {
            $state.go('console.createFilter');
        },
        goToFullScreen: function () {

        }, goCaseConfiguration: function () {
            $state.go('console.caseConfiguration');
        }, goCase: function () {
            $state.go('console.case');
        }, goQueueSlaBreakDown: function () {
            $state.go('console.queueSlaBreakDown');
        }, goTicketFlow: function () {
            $state.go('console.ticketFlow');
        }, goFileSlot: function () {
            $state.go('console.fileslotmaker');
        }, goBillingHistory: function () {
            $state.go('console.billingHistory');
        }, goIvrNodeCountReport: function () {
            $state.go('console.ivrnodecount');
        }, gocSatReport: function () {
            $state.go('console.customersatisfaction');
        }, goAcwReport: function () {
            $state.go('console.acwdetails');
        },
        goQAReport: function () {
            $state.go('console.qaratingreporting');
        }, goMissedCallReport: function () {
            $state.go('console.missedcallreport');
        }, goCampaignNumberUpload: function () {
            $state.go('console.campaignnumberupload');
        }, goDncNumberManage: function () {
            $state.go('console.dncnumbermanage');
        },
        goSecLevels: function () {
            $state.go('console.seclevels');
        },
        newContact: function () {
            $state.go('console.contact-book');
        }, goCallCenterPerformance: function () {
            $state.go('console.callcenterperformance');

        }, goNotices: function () {
            $state.go('console.notices');

        },
        goToAgentDashboard: function () {
            $state.go('console.agentDashboard');

        },
        goToCallCenterPerformanceReport: function () {
            $state.go('console.callCenterPerformanceReport');

        },
        goFileCatRestrict: function () {
            $state.go('console.fileCatRestrict');

        }
    };
    $scope.showDisplayName = false;
    var getUserName = function () {
        var userDetails = loginService.getTokenDecode();
        console.log(userDetails);
        if (userDetails) {
            $scope.userName = userDetails.iss;
            $scope.displayname = $scope.userName;

            myUserProfileApiAccess.getMyProfile().then(function (resMyProf) {
                if (resMyProf.IsSuccess && resMyProf.Result) {
                    myUserProfileApiAccess.getMyOrganization().then(function (resOrg) {

                            if (resOrg.IsSuccess && resOrg.Result) {
                                if (resOrg.Result.ownerRef == resMyProf.Result._id) {
                                    $scope.displayname = resOrg.Result.companyName;
                                }
                                else {
                                    if (resMyProf.Result.firstname && resMyProf.Result.lastname) {
                                        $scope.displayname = resMyProf.Result.firstname + " " + resMyProf.Result.lastname;

                                    }

                                }
                                $scope.showDisplayName = true;
                            }
                            else {
                                if (resMyProf.Result.firstname && resMyProf.Result.lastname) {
                                    $scope.displayname = resMyProf.Result.firstname + " " + resMyProf.Result.lastname;

                                }
                                $scope.showDisplayName = true;
                            }


                        }, function (errOrg) {

                            console.log("Error in searching company");
                            if (resMyProf.Result.firstname && resMyProf.Result.lastname) {
                                $scope.displayname = resMyProf.Result.firstname + " " + resMyProf.Result.lastname;

                            }
                            $scope.showDisplayName = true;
                        }
                    );
                }
                else {
                    console.log("Error in searching client profile");
                    $scope.showDisplayName = true;

                }

            }, function (errMyProf) {
                console.log("Error in searching client profile");
                $scope.showDisplayName = true;
            });


        }
    };
    getUserName();


    $scope.scrollEnabled = false;
    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    //update damith
    $scope.scrollEnabled = false;
    $scope.viewScroll = function () {
        $scope.safeApply(function () {
            $scope.scrollEnabled = true;
        });
    };
    $scope.hideScroll = function () {
        $scope.safeApply(function () {
            $scope.scrollEnabled = false;
        });
    };


    //update pawan


    var authToken = authService.GetToken();
    var displayName = "";
    if (jwtHelper.decodeToken(authToken).context.veeryaccount) {
        displayName = jwtHelper.decodeToken(authToken).context.veeryaccount.display;
    }

    /*$scope.showAlert = function (tittle, type, msg) {
     new PNotify({
     title: tittle,
     text: msg,
     type: type,
     styling: 'bootstrap3',
     icon: false
     });
     };*/

    $scope.monitorProtocol = "user";
    $scope.legID = "";

    var getRegistrationData = function (authToken, password) {

        var decodeData = jwtHelper.decodeToken(authToken);
        console.log("Token Obj " + decodeData);

        if (decodeData.context.veeryaccount) {
            var values = decodeData.context.veeryaccount.contact.split("@");
            var sipUri = "sip:" + decodeData.context.veeryaccount.contact;
            var WSUri = "wss://" + values[1] + ":7443";
            var realm = values[1];
            var username = values[0];
            var displayname = values[0];
            var loginData = {
                realm: realm,
                impi: displayname,
                impu: sipUri,
                display_name: decodeData.iss,
                websocket_proxy_url: WSUri,
                password: password


            }
            loginData.turnServers = turnServers;

            return loginData;

        }
        else {
            return false;
        }


    };

    var onRegistrationCompleted = function (response) {
        //console.log(response);
        console.log("Hit registered");
        console.log("Registerd", "Successfully registered", "success");
        $scope.callListStatus = true;
        $scope.$apply(function () {
            $scope.isRegistered = true;
            $rootScope.$emit('register_status', $scope.isRegistered);

        });

    };

    var onUnRegisterCompleted = function (response) {
        //console.log(response);
        console.log("Unregistered", "Registration terminated", "notice");
        $scope.callListStatus = false;
        $scope.$apply(function () {
            $scope.inCall = false;
            $scope.isRegistered = false;
            $rootScope.$emit('register_status', $scope.isRegistered);
        });

    };

    var onCallDisconnected = function () {
        //console.log(response);
        $scope.isToggleMenu = false;
        $('#callWidget').animate({
            right: '-5%'
        });
        console.log("Call disconnected", "Call is disconnected", "notice");
        $scope.clickBtnStateName = "Waiting";
        $scope.$apply(function () {
            $scope.isCallMonitorOption = 0;
            $scope.inCall = false;
        });

        $scope.CallStatus = null;
        $scope.currentSessionID = null;

        $rootScope.$emit('load_calls', true);


    };

    var onCallConnected = function () {
        $scope.isToggleMenu = true;
        $('#callWidget').animate({
            right: '-6px'
        });
        $scope.$apply(function () {
            console.log("onCallConnected");
            $scope.CallStatus = "LISTEN";
            $scope.clickBtnStateName = "Listen";
            $scope.isCallMonitorOption = 1;
            $scope.inCall = true;
        });

    };

    $scope.RegisterPhone = function (password) {
        var loginData = getRegistrationData(authToken, password);
        if (loginData) {
            Initiate(loginData, onRegistrationCompleted, onCallDisconnected, onCallConnected, onUnRegisterCompleted);
        }
        else {
            console.log("registration failed");
        }
    };

    $scope.UnregisterPhone = function () {
        unregister();
    }

    $scope.HangUpCall = function () {
        hangupCall();
        $scope.CallStatus = null;
        $scope.clickBtnStateName = "waiting";
    };

    $scope.ThreeWayCall = function () {
        //alert("barged: "+bargeID);

        callMonitorSrv.threeWayCall($scope.currentSessionID, $scope.monitorProtocol, displayName, $scope.legID).then(function (resThreeWay) {
            if (resThreeWay.data.IsSuccess) {
                $scope.CallStatus = 'THREEWAY';
                $scope.clickBtnStateName = "Conference ";
            }
            else {
                $scope.showAlert("Call Monitor", "error", "Fail to stablish conference call");
            }
        });


    };

    $scope.BargeCall = function () {
        //alert("barged: "+bargeID);

        callMonitorSrv.bargeCalls($scope.currentSessionID, $scope.monitorProtocol, displayName, $scope.legID).then(function (resBarge) {

            if (resBarge.data.IsSuccess) {

                $scope.CallStatus = "BARGED";
                $scope.clickBtnStateName = "Barged";
            }
            else {
                $scope.showAlert("Call Monitor", "error", "Fail to stablish call barge");
            }
        });

    };

    $scope.ReturnToListen = function () {
        //alert("barged: "+bargeID);
        //
        callMonitorSrv.returnToListen($scope.currentSessionID, $scope.monitorProtocol, displayName, $scope.legID).then(function (resRetToListen) {
            if (resRetToListen.data.IsSuccess) {

                $scope.CallStatus = 'LISTEN';
                $scope.clickBtnStateName = "Listen";
            }
            else {
                $scope.showAlert("Call Monitor", "error", "Fail return to listen");
            }
        });


    };

    $scope.SwapUser = function () {
        //alert("barged: "+bargeID);
        callMonitorSrv.swapUser($scope.currentSessionID, $scope.monitorProtocol, displayName, $scope.legID).then(function (resSwap) {
            if (resSwap.data.IsSuccess) {

                $scope.CallStatus = "SWAPED";
                $scope.clickBtnStateName = "Client";
            }
            else {
                $scope.showAlert("Call Monitor", "error", "Fail to swap between users");
            }
        });


    };

    $rootScope.$on("register_phone", function (event, args) {

        args.turnServers = turnServers;
        Initiate(args, onRegistrationCompleted, onCallDisconnected, onCallConnected, onUnRegisterCompleted);
    });

    $rootScope.$on("check_register", function (event, args) {

        $rootScope.$emit("is_registered", $scope.isRegistered);
    });
    $rootScope.$on("call_listning", function (event, args) {
        $scope.currentSessionID = args.sessionID;
        $scope.monitorProtocol = args.protocol;
        $scope.legID = args.legID;
        $scope.inCall = true;
        $scope.CallStatus = args.CallStatus;

    });
    $rootScope.$on("monitor_panel", function (event, args) {

        $scope.inCall = args;

    });

    //main toggle panle option
    //toggle widget
    $scope.isToggleMenu = false;
    $scope.toggleWidget = function () {
        if ($scope.isToggleMenu) {
            $('#callWidget').animate({
                right: '-5%'
            });
            $scope.isToggleMenu = false;
        } else {
            $('#callWidget').animate({
                right: '-6px'
            });
            $scope.isToggleMenu = true;
        }
    };


    //toggle menu option
    //text function
    var CURRENT_URL = window.location.href.split("?")[0], $BODY = $("body"), $MENU_TOGGLE = $("#menu_toggle"), $SIDEBAR_MENU = $("#sidebar-menu"),
        $SIDEBAR_FOOTER = $(".sidebar-footer"), $LEFT_COL = $(".left_col"), $RIGHT_COL = $(".right_col"), $NAV_MENU = $(".nav_menu"), $FOOTER = $("footer");

    // TODO: This is some kind of easy fix, maybe we can improve this
    var setContentHeight = function () {
        // reset height
        $RIGHT_COL.css('min-height', $(window).height());

        var bodyHeight = $BODY.outerHeight(),
            footerHeight = $BODY.hasClass('footer_fixed') ? 0 : $FOOTER.height(),
            leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
            contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

        // normalize content
        contentHeight -= $NAV_MENU.height() + footerHeight;

        $RIGHT_COL.css('min-height', contentHeight);
    };


    $SIDEBAR_MENU.find('a').on('click', function (ev) {
        $('.child_menu li').removeClass('active');
        var $li = $(this).parent();
        if ($li.is('.active')) {
            $li.removeClass('active');
            $('ul:first', $li).slideUp(function () {
                setContentHeight();
            });
        } else {
            // prevent closing menu if we are on child menu
            if (!$li.parent().is('.child_menu')) {
                $SIDEBAR_MENU.find('li').removeClass('active');
                $SIDEBAR_MENU.find('li ul').slideUp();
            }

            $li.addClass('active');

            $('ul:first', $li).slideDown(function () {
                setContentHeight();
            });
        }

        //slide menu height set daynamically
        $scope.windowMenuHeight = jsUpdateSize() - 120 + "px";
        document.getElementById('sidebar-menu').style.height = $scope.windowMenuHeight;
    });
    // toggle small or large menu
    $MENU_TOGGLE.on('click', function () {
        if ($BODY.hasClass('nav-md')) {
            $BODY.removeClass('nav-md').addClass('nav-sm');

            $('.d-top-h').removeClass('d1-header-lg').addClass('d1-header-wrp-sm');

            if ($SIDEBAR_MENU.find('li').hasClass('active')) {
                $SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
            }
        } else {
            $BODY.removeClass('nav-sm').addClass('nav-md');

            $('.d-top-h').removeClass('d1-header-wrp-sm').addClass('d1-header-lg');


            if ($SIDEBAR_MENU.find('li').hasClass('active-sm')) {
                $SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
            }
        }
        // setContentHeight();


    });


    $scope.MakeNotificationObject = function (data) {
        var callbackObj = JSON.parse(data.Callback);

        callbackObj.From = data.From;
        callbackObj.TopicKey = callbackObj.Topic;
        callbackObj.messageType = callbackObj.MessageType;
        callbackObj.isPersistMessage = true;
        callbackObj.PersistMessageID = data.id;
        return callbackObj;

    };

    $scope.users = [];
    $scope.notificationMsg = {};
    $scope.naviSelectedUser = {};
    $scope.userGroups = [];
    var isPersistanceLoaded = false;

    $scope.loadUsers = function () {
        notifiSenderService.getUserList().then(function (response) {

            if (response) {
                $scope.users = response.map(function (item) {
                    item.status = 'offline';
                    item.callstatus = 'offline';
                    item.callstatusstyle = 'call-status-offline';
                    return item;
                });
            }
            /*for (var i = 0; i < response.length; i++) {

             response[i].status = 'offline';
             response[i].callstatus = 'offline';
             response[i].callstatusstyle = 'call-status-offline';

             }
             $scope.users = response;*/


            $scope.userShowDropDown = 0;

            subscribeServices.Request('pendingall');
            subscribeServices.Request('allstatus');
            subscribeServices.Request('allcallstatus');

            // load notification message
            if (!isPersistanceLoaded) {
                subscribeServices.GetPersistenceMessages().then(function (response) {

                    if (response.data.IsSuccess) {
                        isPersistanceLoaded = true;

                        angular.forEach(response.data.Result, function (value) {

                            var valObj = JSON.parse(value.Callback);

                            if (valObj.eventName == "todo_reminder") {
                                //$scope.todoRemind($scope.MakeNotificationObject(value));
                            }
                            else {
                                $scope.OnMessage($scope.MakeNotificationObject(value));
                            }


                        });

                    }


                }, function (err) {

                });
            }

        }, function (err) {
            loginService.isCheckResponse(err);
            $scope.showAlert("Load Users", "error", "Fail To Get User List.")
        });
    };
    $scope.loadUsers();

    //load userGroup list
    $scope.userGroups = [];
    $scope.loadUserGroups = function () {
        notifiSenderService.getUserGroupList().then(function (response) {
            if (response.data && response.data.IsSuccess) {
                for (var j = 0; j < response.data.Result.length; j++) {
                    var userGroup = response.data.Result[j];
                    userGroup.listType = "Group";
                }
                $scope.userGroups = response.data.Result;
            }
        }, function (err) {
            loginService.IsCheckResponse(err);
            $scope.showAlert("Load User Groups", "error", "Fail To Get User Groups.")
        });
    };
    $scope.loadUserGroups();


    $scope.showMessageBlock = function (selectedUser) {
        $scope.naviSelectedUser = selectedUser;
        divModel.model('#sendMessage', 'display-block');
    };
    $scope.closeMessage = function () {
        divModel.model('#sendMessage', 'display-none');
    };

    $scope.showRightSideNav = false;

    $scope.openNav = function () {
        if (!$scope.showRightSideNav) {
            document.getElementById("mySidenav").style.width = "300px";
            //  document.getElementById("main").style.marginRight = "285px";
            $scope.showRightSideNav = true;
            /*getAllRealTimeTimer = $timeout(getAllRealTime, 1000);*/

        }
        else {
            document.getElementById("mySidenav").style.width = "0";
            //document.getElementById("main").style.marginRight = "0";
            /*if (getAllRealTimeTimer) {
             $timeout.cancel(getAllRealTimeTimer);
             }*/
            $scope.showRightSideNav = false;
        }
        $scope.isUserListOpen = !$scope.isUserListOpen;
        $scope.onClickGetHeight();

        //document.getElementById("main").style.marginRight = "285px";
        // document.getElementById("navBar").style.marginRight = "300px";
    };
    /* Set the width of the side navigation to 0 */
    $scope.closeNav = function () {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("main").style.marginRight = "0";
    };


    $scope.sendNotification = function () {
        if ($scope.naviSelectedUser) {
            $scope.notificationMsg.From = $scope.userName;
            $scope.notificationMsg.Direction = "STATELESS";
            $scope.isSendingNotifi = true;
            if ($scope.naviSelectedUser.listType === "Group") {

                subscribeServices.getGroupMembers($scope.naviSelectedUser._id).then(function (response) {
                    if (response.IsSuccess) {
                        if (response.Result) {
                            var clients = [];
                            for (var i = 0; i < response.Result.length; i++) {
                                var gUser = response.Result[i];
                                //if (gUser && gUser.username && gUser.username != $scope.loginName) {
                                clients.push(gUser.username);
                                //}
                            }
                            $scope.notificationMsg.clients = clients;
                            $scope.notificationMsg.isPersist=true;
                            notifiSenderService.broadcastNotification($scope.notificationMsg).then(function (response) {
                                $scope.notificationMsg = {};
                                console.log("send notification success :: " + JSON.stringify(clients));
                            }, function (err) {
                                var errMsg = "Send Notification Failed";
                                if (err.statusText) {
                                    errMsg = err.statusText;
                                }
                                $scope.showAlert('Error', 'error', errMsg);
                            });
                        } else {
                            $scope.showAlert('Error', 'error', "Send Notification Failed");
                        }
                    }
                    else {
                        console.log("Error in loading Group member list");
                        $scope.showAlert('Error', 'error', "Send Notification Failed");
                    }
                    $scope.isSendingNotifi = false;
                }, function (err) {
                    console.log("Error in loading Group member list ", err);
                    $scope.showAlert('Error', 'error', "Send Notification Failed");
                });
            } else {
                $scope.notificationMsg.To = $scope.naviSelectedUser.username;
                $scope.notificationMsg.isPersist=true;
                notifiSenderService.sendNotification($scope.notificationMsg, "message", "").then(function (response) {
                    console.log("send notification success :: " + $scope.notificationMsg.To);
                    $scope.notificationMsg = {};
                }, function (err) {
                    authService.IsCheckResponse(err);
                    var errMsg = "Send Notification Failed";
                    if (err.statusText) {
                        errMsg = err.statusText;
                    }
                    $scope.showAlert('Error', 'error', errMsg);
                });
            }
            $scope.isSendingNotifi = false;

        } else {
            $scope.showAlert('Error', 'error', "Send Notification Failed");
        }
    };


    $scope.usersToNotify = [];

    $scope.checkUser = function ($event, agent) {

        if ($event.target.checked) {
            if ($scope.usersToNotify.indexOf(agent.username) == -1) {
                $scope.usersToNotify.push(agent.username);
            }

        }
        else {
            if ($scope.usersToNotify.indexOf(agent.username) == -1) {
                $scope.usersToNotify.splice($scope.usersToNotify.indexOf(agent.username), 1);
            }
        }
    };


    $scope.showMesssageModal = false;

    $scope.showNotificationMessage = function (notifyMessage) {

        $scope.showMesssageModal = true;

        $scope.showModal(notifyMessage);


        //$scope.showAlert("Message","success",notifyMessage.Message);
    };


    $scope.discardNotifications = function (notifyMessage) {
        $scope.newNotifications.splice($scope.newNotifications.indexOf(notifyMessage), 1);
        $scope.unredNotifications = $scope.newNotifications.length;
    };

    $scope.showModal = function (MessageObj) {
        //modal show
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'views/notification-sender/messageModal.html',
            controller: 'notificationModalController',
            size: 'sm',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                MessageObj: function () {
                    return MessageObj;
                },
                DiscardNotifications: function () {
                    return $scope.discardNotifications;
                }
            }
        });
    };

    //Detect Document Height
    //update code damith
    $(document).ready(function () {
        // moment.lang("fr"); // Set current local to French
        window.onload = function () {
            $scope.windowHeight = jsUpdateSize() - 100 + "px";
            document.getElementById('onlineUserWraper').style.height = $scope.windowHeight;

            //slide menu height set daynamically
            $scope.windowMenuHeight = jsUpdateSize() - 120 + "px";
            document.getElementById('sidebar-menu').style.height = $scope.windowMenuHeight;
        };

        window.onresize = function () {
            $scope.windowHeight = jsUpdateSize() - 100 + "px";
            document.getElementById('onlineUserWraper').style.height = $scope.windowHeight;

            //slide menu height set daynamically
            $scope.windowMenuHeight = jsUpdateSize() - 120 + "px";
            document.getElementById('sidebar-menu').style.height = $scope.windowMenuHeight;
        };
    });

    $scope.onClickGetHeight = function () {
        $scope.windowHeight = jsUpdateSize() - 100 + "px";
        document.getElementById('onlineUserWraper').style.height = $scope.windowHeight;
    };


    //Get user image list
    //
    userImageList.getAllUsers(function (res) {
        if (res) {
            userImageList.getAvatarByUserName($scope.userName, function (res) {
                $scope.profileAvatat = res;
            });
        }
    });


});

mainApp.controller("notificationModalController", function ($scope, $uibModalInstance, MessageObj, DiscardNotifications) {


    $scope.showMesssageModal = true;
    $scope.MessageObj = MessageObj;


    $scope.keepNotification = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.discardNotification = function (msgObj) {
        DiscardNotifications(msgObj);
        $uibModalInstance.dismiss('cancel');
    }
    $scope.addToTodo = function () {

    }


});
