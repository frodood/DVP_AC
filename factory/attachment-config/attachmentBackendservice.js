/**
 * Created by Pawan on 3/24/2017.
 */
mainApp.factory('attachmentBackendService', function ($http, authService,baseUrls)
{
    return {



        saveNewAttachment: function (resource) {
            var authToken = authService.GetToken();

            return $http({
                method: 'POST',
                url: baseUrls.ticketUrl + "Attachment",
                data:resource

            }).then(function(response)
            {
                return response.data;
            });
        }



    }
});