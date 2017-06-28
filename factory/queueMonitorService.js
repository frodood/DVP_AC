/**
 * Created by a on 5/29/2016.
 */



'use strict';

mainApp.factory("queueMonitorService", function ($http, baseUrls) {


    var getAllConcurrentQueue = function () {
        //dashboard.app.veery.cloud
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl+"DashboardGraph/ConcurrentQueued/" + queue + "/5"
        }).then(function (response) {
            if (response.data) {
                if(response.data.IsSuccess && response.data.Result && response.data.Result[0].datapoints){
                    return response.data.Result[0].datapoints;
                }else{
                    return {};
                }
            } else {
                return {};
            }
        });
    };


    var getAllQueueStats = function () {
        //dashboard.app.veery.cloud
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl+"DashboardEvent/QueueDetails"
        }).then(function (response) {
            if (response.data) {
                if(response.data.IsSuccess && response.data.Result){
                    return response.data.Result;
                }else{
                    return 0;
                }
            } else {

                return [];
            }
        });

    };

    var getSingleQueueStats = function (queue) {
        //dashboard.app.veery.cloud
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl+"DashboardEvent/QueueSingleDetail/" + queue
        }).then(function (response) {
            if (response.data) {
                if(response.data.IsSuccess && response.data.Result){
                    return response.data.Result;
                }else{
                    return 0;
                }
            } else {
                return {};
            }
        });

    };

    var getSingleQueueGraph = function (queue) {
        //dashboard.app.veery.cloud
        return $http({
            method: 'GET',
            url: baseUrls.dashBordUrl+"DashboardGraph/ConcurrentQueued/"+ queue+"/5"
        }).then(function (response) {
            if (response.data) {
                if(response.data.IsSuccess && response.data.Result && response.data.Result[0].datapoints){
                    return response.data.Result[0].datapoints;
                }else{
                    return {};
                }
            } else {

                return {};
            }
        });

    };
    var getAvailableResourcesToSkill = function (skillObj) {
        //dashboard.app.veery.cloud
        return $http({
            method: 'POST',
            url: baseUrls.ardsmonitoringBaseUrl+"MONITORING/resources",
            data: skillObj
        }).then(function (response) {
            if (response.data) {
                if(response.data.IsSuccess && response.data.Result ){
                    return response.data.Result;
                }else{
                    return {};
                }
            } else {

                return {};
            }
        });

    };







    return {
        GetAllQueueStats: getAllQueueStats,
        GetAllConcurrentQueue: getAllConcurrentQueue,
        GetSingleQueueStats: getSingleQueueStats,
        GetSingleQueueGraph: getSingleQueueGraph,
        getAvailableResourcesToSkill: getAvailableResourcesToSkill

    }
});


