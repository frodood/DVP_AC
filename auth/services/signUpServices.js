/**
 * Created by Damith on 6/18/2016.
 */

(function () {
    'use strict';
    mainApp.factory('signUpServices', Service);
    function Service($http, baseUrls) {
        var service = {};
        service.createNewUser = createNewUser;
        service.createOrganisation = createOrganisation;
        service.checkUniqueOrganization = CheckUniqueOrganization;
        service.checkUniqueOwner = CheckUniqueOwner;
        return service;

        //create new user
        //http://192.168.5.103:3636
        //http://userservice.app.veery.cloud
        function createNewUser(param, callback) {
            $http.post(baseUrls.UserServiceBaseUrl + "Organisation/Owner", param).success(function (data, status, headers, config) {
                callback(true);
            }).error(function (data, status, headers, config) {
                callback(false);
            });
        }

        //create Organisation
        function createOrganisation(param, callback) {
            $http.post(baseUrls.UserServiceBaseUrl + "Organisation", param).success(function (data, status, headers, config) {
                callback(true);
            }).error(function (data, status, headers, config) {
                callback(false);
            });
        }

        //is check Organisation name
        function CheckUniqueOrganization(orgName, callback) {
            $http.get(baseUrls.UserServiceBaseUrl + "Organization/" + orgName + "/exists").success(function (data, status, headers, config) {
                callback(data.IsSuccess);
            }).error(function (data, status, headers, config) {
                callback(false);
            });
        }

        //is check user exists
        function CheckUniqueOwner(ownerName, callback) {
            $http.get(baseUrls.UserServiceBaseUrl + "Owner/" + ownerName + "/exists").success(function (data, status, headers, config) {
                callback(data.IsSuccess);
            }).error(function (data, status, headers, config) {
                callback(false);
            });
        }
    }


})();

