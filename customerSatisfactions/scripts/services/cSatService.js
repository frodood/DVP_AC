/**
 * Created by Rajinda on 12/31/2015.
 */

mainApp.factory("cSatService", function ($http, download,authService,baseUrls) {

    var getSatisfactionRequest = function (page,size,start,end,  satisfaction ) {

        var squr = "&satisfaction="+satisfaction;
        if(satisfaction===undefined ||satisfaction==="all"){
            squr = "";
        }
        return $http({
            method: 'GET',
            url: baseUrls.cSatUrl+ "CustomerSatisfactions/Request/"+page+"/"+size+"?start="+start+"&end="+end+squr
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getSatisfactionRequestCount = function (start,end,  satisfaction ) {

        var squr = "&satisfaction="+satisfaction;
        if(satisfaction===undefined ||satisfaction==="all"){
            squr = "";
        }
        return $http({
            method: 'GET',
            url: baseUrls.cSatUrl+ "CustomerSatisfactions/Count?start="+start+"&end="+end+squr
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return 0;
            }
        });
    };

    var getSatisfactionRequestReport = function (start,end) {
        return $http({
            method: 'GET',
            url: baseUrls.cSatUrl+ "CustomerSatisfactions/Report?start="+start+"&end="+end
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

  return {
      GetSatisfactionRequest: getSatisfactionRequest,
      GetSatisfactionRequestCount:getSatisfactionRequestCount,
      GetSatisfactionRequestReport:getSatisfactionRequestReport
  }

});

