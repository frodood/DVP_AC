/**
 * Created by Pawan on 11/22/2016.
 */

mainApp.factory('billingHistoryService', function ($http, baseUrls) {

    return {

        getBillingHistory: function (rowCount,pageNo) {
            return $http({
                method: 'GET',
                url: baseUrls.walletUrl+"/WalletHistory/"+rowCount+"/"+pageNo
            }).then(function(response)
            {
                return response;
            });
        }


    }
});