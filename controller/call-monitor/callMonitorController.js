/**
 * Created by Pawan on 7/21/2016.
 */

mainApp.controller('callmonitorcntrl', function ($scope, $rootScope, $state, $uibModal, $timeout,
                                                 callMonitorSrv, notificationService,
                                                 jwtHelper, authService, loginService,$anchorScroll) {

    $anchorScroll();
    $scope.CallObj = {};
    $scope.isRegistered = false;
    $scope.currentSessionID = null;
    var authToken = authService.GetToken();

    $rootScope.$on("is_registered", function (events, args) {
        console.log("isRegisterd " + args);
        $scope.isRegistered = args;


    });


    var protocol = "user";
    var actionObject = {};

    var onCallsDataReceived = function (response) {

        if (!response.data.IsSuccess) {
            onError(response.data.Exception.Message);
        }
        else {
            /*notificationService.success({
             title: 'ok',
             text: "ok",
             hide: false
             });*/
            //var callObj=JSON.stringify('{"Exception":null,"CustomMessage":"Operation Successfull","IsSuccess":true,"Result":{"cc392087-76f0-4bac-aebb-caff14d2de6c":[{"Channel-State":"CS_EXCHANGE_MEDIA","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/internal/dave@124.43.64.26:13776","Call-Direction":"outbound","Caller-Destination-Number":"dave","Caller-Unique-ID":"cc392087-76f0-4bac-aebb-caff14d2de6c","variable_sip_auth_realm":"null","variable_dvp_app_id":"3","Caller-Caller-ID-Number":"charlie","Other-Leg-Unique-ID":"dd64403b-35ef-400a-bf36-2d7ef7607dc7","Channel-Call-State":"ACTIVE"},{"Channel-State":"CS_EXECUTE","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/internal/charlie@159.203.160.47","Call-Direction":"inbound","Caller-Destination-Number":"2004","Caller-Unique-ID":"dd64403b-35ef-400a-bf36-2d7ef7607dc7","variable_sip_auth_realm":"159.203.160.47","variable_dvp_app_id":"null","Caller-Caller-ID-Number":"charlie","Channel-Call-State":"ACTIVE","Application-Type":"EXTENDED","Other-Leg-Unique-ID":"cc392087-76f0-4bac-aebb-caff14d2de6c","Bridge-State":"Bridged"}],"d453d7a7-3c19-48e8-9047-e347287a1474":[{"Channel-State":"CS_EXECUTE","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/internal/eve@159.203.160.47","Call-Direction":"inbound","Caller-Destination-Number":"2002","Caller-Unique-ID":"d453d7a7-3c19-48e8-9047-e347287a1474","variable_sip_auth_realm":"159.203.160.47","variable_dvp_app_id":"null","Caller-Caller-ID-Number":"eve","Channel-Call-State":"ACTIVE","Application-Type":"EXTENDED","Other-Leg-Unique-ID":"d3808e91-a5e0-456c-a4bd-39a0003d81e6","Bridge-State":"Bridged"},{"Channel-State":"CS_EXCHANGE_MEDIA","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/internal/bob@124.43.64.26:14490","Call-Direction":"outbound","Caller-Destination-Number":"bob","Caller-Unique-ID":"d3808e91-a5e0-456c-a4bd-39a0003d81e6","variable_sip_auth_realm":"null","variable_dvp_app_id":"3","Caller-Caller-ID-Number":"eve","Other-Leg-Unique-ID":"d453d7a7-3c19-48e8-9047-e347287a1474","Channel-Call-State":"ACTIVE"}],"5fedd42a-7f44-4548-8b18-19613c1fe24b":[{"Channel-State":"CS_EXECUTE","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/external/18705056540@45.55.184.114","Call-Direction":"inbound","Caller-Destination-Number":"94777400400","Caller-Unique-ID":"5fedd42a-7f44-4548-8b18-19613c1fe24b","variable_sip_auth_realm":"null","variable_dvp_app_id":"null","Caller-Caller-ID-Number":"18705056540","Channel-Call-State":"ACTIVE","Application-Type":"HTTAPI"}]}}');
            console.log(JSON.stringify(response.data));
            ValidCallsPicker(response.data);
            $scope.inCall=false;

        }

    };
    var onError = function (error) {
        console.log(error);
    };

    var ValidCallsPicker = function (callObj) {

        var curCallArr = [];
        $scope.CallObj = {};

        var callObjLen = Object.keys(callObj.Result).length;
        console.log("DB Call count " + callObjLen);

        for (var i = 0; i < callObjLen; i++) {
            var keyObj = callObj.Result[Object.keys(callObj.Result)[i]];

            if (keyObj.length > 1) {
                var callObject = CallObjectCreator(keyObj);
                if (callObject) {

                    curCallArr.push(callObject);
                    $scope.CallObj = curCallArr;
                    console.log("Call Object " + $scope.CallObj);
                }
                else {
                    $scope.CallObj = {}
                }

            }


            if (i == callObjLen - 1) {
                console.log("Current calls " + JSON.stringify(curCallArr));
            }
        }

    };
  
  
  var CallObjectCreator = function (objKey) {
        var bargeID = "";
        var otherID = "";
        var FromID = "";
        var ToID = "";
        var Direction = "";
        var Receiver = "";
        var Bridged = false;
        var newKeyObj = {};
        var skill = "";
        var callDuration = "";
        var localTime = "";

        for (var j = 0; j < objKey.length; j++) {

            if (objKey[j]["DVP-Call-Direction"]) {
                Direction = objKey[j]["DVP-Call-Direction"];
            }

            if (objKey[j]['Call-Direction'] == "inbound") {


                FromID = objKey[j]['Caller-Caller-ID-Number'];
                ToID = objKey[j]['Caller-Destination-Number'];
                otherID = objKey[j]['Caller-Unique-ID'];;

                if (objKey[j]['Bridge-State'] == "Bridged") {
                    Bridged = true;
                }

                if (objKey[j]['CHANNEL-BRIDGE-TIME']) {
                    var b = moment(objKey[j]['CHANNEL-BRIDGE-TIME']);

                    localTime = b.local().format('YYYY-MM-DD HH:mm:ss');
                }

                if(objKey[j]['BRIDGE-DURATION'])
                {
                    callDuration = objKey[j]['BRIDGE-DURATION'];
                }



            }
            else if (objKey[j]['Call-Direction'] == "outbound") {
                Receiver = objKey[j]['Caller-Destination-Number'];
                bargeID = objKey[j]['Caller-Unique-ID'];
            }



            if (objKey[j]['ARDS-Skill-Display'] && objKey[j]['ARDS-Skill-Display'] !== 'null') {
                skill = objKey[j]['ARDS-Skill-Display'];
            }




            ////if (j == objKey.length - 1) {
            //if(objKey[j]['Call-Direction'] === 'inbound'){
            //    if (Bridged) {
            //        newKeyObj.FromID = FromID;
            //        newKeyObj.ToID = ToID;
            //        newKeyObj.BargeID = bargeID;
            //        newKeyObj.Direction = Direction;
            //        newKeyObj.Receiver = Receiver;
            //        newKeyObj.CallDuration = objKey[j]['BRIDGE-DURATION'];
            //        newKeyObj.Skill = skill;
            //        newKeyObj.LocalTime = localTime;
            //
            //        //return newKeyObj;
            //    }else{
            //
            //        newKeyObj.BargeID = bargeID;
            //        newKeyObj.Receiver =
            //    }
            //
            //}

        }

        if (Bridged) {
            newKeyObj.FromID = FromID;
            newKeyObj.ToID = ToID;
            newKeyObj.BargeID = bargeID;
            newKeyObj.Direction = Direction;
            newKeyObj.Receiver = Receiver;
            newKeyObj.Skill = skill;
            newKeyObj.LocalTime = localTime;
            newKeyObj.CallDuration = callDuration;
        }

        if(Direction === 'outbound')
            newKeyObj.BargeID = otherID;



        return newKeyObj;
    };
  
  

  
  
    $scope.showAlert = function (title, content, type) {

        new PNotify({
            title: title,
            text: content,
            type: type,
            styling: 'bootstrap3'
        });
    };


    $scope.pickPassword = function (response) {
        $scope.password = response;
        console.log("Hit");
        console.log("password ", response);

        if ($scope.password != null) {
            console.log("Password picked " + $scope.password);
            $scope.loginData.password = $scope.password;
            //Initiate($scope.loginData,onRegistrationCompleted, onCallDisconnected, onCallConnected,onUnRegisterCompleted);
            $rootScope.$emit("register_phone", $scope.loginData);
        }
    };


    $scope.showModal = function (User) {
        //modal show
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'views/call-monitor/partials/loginModal.html',
            controller: 'loginModalController',
            size: 'sm',
            resolve: {
                user: function () {
                    return User;
                },
                pickPassword: function () {
                    return $scope.pickPassword;
                }
            }
        });
    };


    $scope.LoadCurrentCalls = function () {
        $rootScope.$emit("monitor_panel", false);
        callMonitorSrv.getCurrentCalls().then(onCallsDataReceived, onError);
    };

    $scope.RegisterThePhone = function () {

        //$rootScope.$emit("register_phone",);
        getRegistrationData(authToken);
        $scope.LoadCurrentCalls();
    }


    var getRegistrationData = function (authToken) {

        var decodeData = jwtHelper.decodeToken(authToken);
        console.log("Token Obj " + decodeData);

        if (decodeData.context.veeryaccount) {
            var values = decodeData.context.veeryaccount.contact.split("@");
            $scope.sipUri = "sip:" + decodeData.context.veeryaccount.contact;
            $scope.WSUri = "wss://" + values[1] + ":7443";
            $scope.realm = values[1];
            $scope.username = values[0];
            $scope.displayname = decodeData.context.veeryaccount.display;
            $scope.loginData = {
                realm: $scope.realm,
                impi: $scope.username,
                impu: $scope.sipUri,
                display_name: decodeData.iss,
                websocket_proxy_url: $scope.WSUri


            }

            console.log("Showing modal ..................................................");
            //$scope.showModal(decodeData.iss);
        }
        else {
            $scope.showAlert("Error", "Unauthorized user details to login ", "error");
        }


    };

    getRegistrationData(authToken);
    $rootScope.$on('load_calls', function (event, args) {

        $scope.LoadCurrentCalls();

    });

    $rootScope.$on('register_status', function (event, args) {

        $scope.isRegistered = args;
        var moduleSt = [];
        if (args) {
            moduleSt = ["success", "Registered"];

        }
        else {
            moduleSt = ["notice", "Unregistered"];
        }

        $scope.showAlert("Info", " Supervisor call monitor module " + moduleSt[1], moduleSt[0]);


        if ($scope.isRegistered && actionObject && actionObject.action == "LISTEN") {
            $scope.currentSessionID = actionObject.BargeID;
            callMonitorSrv.listenCall(actionObject.BargeID, actionObject.protocol, actionObject.displayname).then(function (listenData) {
                actionObject = {};
                if (!listenData.data.IsSuccess) {
                    console.log("Invalid or Disconnected call, Loading Current list ", listenData.data.CustomMessage);
                    $scope.showAlert("Info", "Invalid or Disconnected call, Loading Current list", "notice");
                    $scope.LoadCurrentCalls();
                }
                else
                {
                    var listenObj =
                    {
                        sessionID:$scope.currentSessionID,
                        protocol:protocol,
                        legID:listenData.data.Result
                    }
                    $rootScope.$emit("call_listning", listenObj);
                }


            }, function (error) {
                loginService.isCheckResponse(error);
                actionObject = {};
                console.log("Invalid or Disconnected call, Loading Current list ", error);
                $scope.showAlert("Info", "Invalid or Disconnected call, Loading Current list", "notice");
                $scope.LoadCurrentCalls();
            });
        }

    });

    $scope.ListenCall = function (callData) {
        //alert("barged: "+bargeID);
        $scope.isRegistered=true;
        $scope.inCall=true;
        if ($scope.isRegistered) {
            $scope.currentSessionID = callData.BargeID;
            callMonitorSrv.listenCall(callData.BargeID, protocol, $scope.displayname).then(function (listenData) {

                if (!listenData.data.IsSuccess) {
                    console.log("Invalid or Disconnected call, Loading Current list ", listenData.data.CustomMessage);
                    $scope.showAlert("Info", "Invalid or Disconnected call, Loading Current list", "notice");
                    $scope.LoadCurrentCalls();
                    $scope.inCall=false;
                }else
                {

                    var listenObj =
                    {
                        sessionID:$scope.currentSessionID,
                        protocol:protocol,
                        legID:listenData.data.Result,
                        CallStatus:"LISTEN"
                    }
                    $rootScope.$emit("call_listning", listenObj);

                }

            }, function (error) {
                loginService.isCheckResponse(error);
                console.log("Invalid or Disconnected call, Loading Current list ", error);
                $scope.showAlert("Info", "Invalid or Disconnected call, Loading Current list", "notice");
                $scope.inCall=false;
                $scope.LoadCurrentCalls();

            });
        }
        else {
            getRegistrationData(authToken);
            actionObject = {
                action: "LISTEN",
                BargeID: callData.BargeID,
                protocol: protocol,
                displayname: $scope.displayname
            };

        }


    };


    /*getRegistrationData(authToken);
     $scope.LoadCurrentCalls();*/
    $rootScope.$emit("check_register", null);

    if ($scope.isRegistered) {
        $scope.LoadCurrentCalls();
    }
    else {
        console.log("going to register");
        //$scope.RegisterThePhone();
    }


});

mainApp.controller("loginModalController", function ($scope, $rootScope, $uibModalInstance, user, pickPassword) {


    $scope.showModal = true;

    $scope.username = user;

    $scope.ok = function () {
        pickPassword($scope.userPasssword);
        $scope.showModal = false;
        $uibModalInstance.close($scope.password);
    };

    $scope.loginPhone = function () {
        pickPassword($scope.userPasssword);
        $scope.showModal = false;
        $uibModalInstance.close($scope.password);
    };

    $scope.closeModal = function () {
        pickPassword(null);
        $scope.showModal = false;
        $uibModalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
        pickPassword(null);
        $scope.showModal = false;
        $uibModalInstance.dismiss('cancel');
    };


});
