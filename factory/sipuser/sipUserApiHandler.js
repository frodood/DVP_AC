/**
 * Created by dinusha on 6/2/2016.
 */
(function() {

  var sipUserApiHandler = function($http, authService, baseUrls)
  {
    var getSIPUsers = function()
    {
      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'Users'
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var validateUsername = function (usr)
    {
      
      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'User/' + usr
      }).then(function (resp)
      {
        return resp.data;
      })
    };

    var validateExtension = function(ext)
    {

      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'Extension/' + ext
      }).then(function (resp) {
        return resp.data;
      })
    };

    var getGroups = function()
    {

      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'Groups'
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var deleteGroup = function(grpId)
    {

      return $http({
        method: 'DELETE',
        url: baseUrls.sipUserendpoint + 'Group/' + grpId
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var getGroup = function(id)
    {

      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'Group/' + id
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var getUsersForGroup = function(id)
    {

      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'Users/InGroup/' + id
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var getSIPUser = function(username)
    {

      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'User/' + username
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var getExtension = function(extId)
    {

      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'Extension/' + extId
      }).then(function(resp)
      {
        return resp.data;
      })
    };


    var addUserToGroup = function(usrId, grpId)
    {

      return $http({
        method: 'POST',
        url: baseUrls.sipUserendpoint + usrId + '/AssignToGroup/' + grpId
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var removeUserFromGroup = function(usrId, grpId)
    {

      return $http({
        method: 'POST',
        url: baseUrls.sipUserendpoint + usrId + '/RemoveFromGroup/' + grpId
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var saveSIPUser = function(usrObj)
    {

      return $http({
        method: 'POST',
        url: baseUrls.sipUserendpoint + 'User',
        data:usrObj
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var setPublicUser = function(usrObj)
    {

      return $http({
        method: 'POST',
        url: baseUrls.sipUserendpoint + 'DuoWorldUser',
        data:usrObj
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var saveTransferCodes = function(transCodes)
    {

      return $http({
        method: 'POST',
        url: baseUrls.sipUserendpoint + 'TransferCodes',
        data:transCodes
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var updateTransferCodes = function(transCodes)
    {

      return $http({
        method: 'PUT',
        url: baseUrls.sipUserendpoint + 'TransferCode/' + transCodes.id,
        data:transCodes
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var getTransferCodes = function()
    {

      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'TransferCode'
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var saveGroup = function(grpObj)
    {

      return $http({
        method: 'POST',
        url: baseUrls.sipUserendpoint + 'Group',
        data:grpObj
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var updateGroup = function(grpObj)
    {

      return $http({
        method: 'PUT',
        url: baseUrls.sipUserendpoint + 'Group/' + grpObj.id,
        data:grpObj
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var getContexts = function()
    {

      return $http({
        method: 'GET',
        url: baseUrls.sipUserendpoint + 'Context'
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var assignExtensionToUser = function(ext, sipUserId)
    {

      return $http({
        method: 'POST',
        url: baseUrls.sipUserendpoint + 'Extension/' + ext + '/AssignToSipUser/' + sipUserId
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var assignExtensionToGroup = function(ext, grpId)
    {

      return $http({
        method: 'POST',
        url: baseUrls.sipUserendpoint + 'Extension/' + ext + '/AssignToGroup/' + grpId
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var addNewExtension = function(extObj)
    {

      return $http({
        method: 'POST',
        url: baseUrls.sipUserendpoint + 'Extension',
        data:extObj
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var deleteExtension = function(ext)
    {

      return $http({
        method: 'DELETE',
        url: baseUrls.sipUserendpoint + 'Extension/' + ext
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var getSchedules = function()
    {

      return $http({
        method: 'GET',
        url: baseUrls.limitHandlerUrl + 'LimitAPI/Schedules/byCompany'
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var getGreetingFileMetadata = function(refId)
    {

      return $http({
        method: 'GET',
        url: baseUrls.fileServiceUrl + 'Files/' + refId + '/PABX/USER/GREETING'
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var updateUser = function(usrObj)
    {

      return $http({
        method: 'PUT',
        url: baseUrls.sipUserendpoint + 'User/' + usrObj.SipUsername,
        data: usrObj
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var deleteSipUser = function(usrObj)
    {

      return $http({
        method: 'DELETE',
        url: baseUrls.sipUserendpoint + 'User/' + usrObj.SipUsername
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    var getDomains = function()
    {

      return $http({
        method: 'GET',
        url: baseUrls.clusterconfigUrl + 'CloudEndUsers'
      }).then(function(resp)
      {
        return resp.data;
      })
    };

    return {
      getGreetingFileMetadata: getGreetingFileMetadata,
      getSIPUsers: getSIPUsers,
      getSchedules: getSchedules,
      getContexts: getContexts,
      getSIPUser: getSIPUser,
      saveSIPUser: saveSIPUser,
      addNewExtension: addNewExtension,
      assignExtensionToUser: assignExtensionToUser,
      getGroups: getGroups,
      getGroup: getGroup,
      getUsersForGroup: getUsersForGroup,
      addUserToGroup: addUserToGroup,
      saveGroup: saveGroup,
      updateGroup: updateGroup,
      getExtension: getExtension,
      saveTransferCodes: saveTransferCodes,
      updateTransferCodes: updateTransferCodes,
      getTransferCodes: getTransferCodes,
      setPublicUser: setPublicUser,
      updateUser: updateUser,
      getDomains: getDomains,
      removeUserFromGroup: removeUserFromGroup,
      deleteGroup: deleteGroup,
      assignExtensionToGroup: assignExtensionToGroup,
      deleteExtension: deleteExtension,
      validateUsername: validateUsername,
      validateExtension: validateExtension,
      deleteSipUser: deleteSipUser

    };
  };

  var module = angular.module("veeryConsoleApp");
  module.factory("sipUserApiHandler", sipUserApiHandler);

}());
