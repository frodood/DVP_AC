mainApp.controller('emailConnectorController', function FormBuilderCtrl($scope, $window,tagBackendService, socialConnectorService,$anchorScroll)
{
    $anchorScroll();

    $scope.showAlert = function (tittle, type, content) {
        new PNotify({
            title: tittle,
            text: content,
            type: type,
            styling: 'bootstrap3'
        });
    };

    $scope.emailConfig = {
        ticket_priority:"",
        ticket_type:"",
        ticket_tags:[],
        name:""
    };
    $scope.ticket_tags=[];
    $scope.tagList=[];
    $scope.availableTags=[];
    $scope.availableTicketTypes=['question','complain','incident','action'];
    $scope.prioritys=['low','normal','high','urgent'];

    function createTagFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(group) {
            return (group.name.toLowerCase().indexOf(lowercaseQuery) != -1);
        };
    }

    $scope.queryTagSearch = function (query) {
        if (query === "*" || query === "") {
            if ($scope.availableTags) {
                return $scope.availableTags;
            }
            else {
                return [];
            }

        }
        else {
            var results = query ? $scope.availableTags.filter(createTagFilterFor(query)) : [];
            return results;
        }

    };

    $scope.saveEmailConfiguration = function (emailConfig) {
        emailConfig.ticket_tags = $scope.ticket_tags.map(function (item) {
            return item.name;
        });

        socialConnectorService.CreateMailAccount(emailConfig).then(function (response) {
            if(response){
                $scope.showAlert("Email","success", "Save Configurations.");
                $scope.GetEmailAccounts();
            }
            else {
                $scope.showAlert("Email","error", "Fail To Save Configurations.");
            }
        }, function (err) {
            $scope.showAlert("Email","error", "Fail To Save Configurations.");
        });
    };

    $scope.emailAccounts = [];
    $scope.GetEmailAccounts = function () {
        socialConnectorService.GetEmailAccounts().then(function (response) {
            $scope.emailAccounts = response;
        }, function (err) {
            $scope.showAlert("Email","error", "Fail To Get Email List.");
        });
    };
    $scope.GetEmailAccounts();

    $scope.loadTags = function () {
        tagBackendService.getAllTags().then(function (response) {
            $scope.tagList = response.data.Result;
            $scope.availableTags = $scope.availableTags.concat($scope.tagList);
        }, function (err) {
            $scope.showAlert("Email","error", "Fail To Get Tag List.");
        });
    };
    $scope.loadTags();


});