var app = angular.module('fantasyFitness')
.config(['$stateProvider', function($stateProvider) {

}])
.controller('ScoreCtrl', ['$scope', function($scope) {
    $scope.dates = getWeek();
    $scope.dateRange = [$scope.dates[0],$scope.dates[6]];

    function getWeek() {
        var today = new Date(),
            sun = today.getDate() - today.getDay(),
            mon = sun + 1,
            tue = sun + 2,
            wed = sun + 3,
            thu = sun + 4,
            fri = sun + 5,
            sat = sun + 6;
        return [
            new Date(today.setDate(sun)),
            new Date(today.setDate(mon)),
            new Date(today.setDate(tue)),
            new Date(today.setDate(wed)),
            new Date(today.setDate(thu)),
            new Date(today.setDate(fri)),
            new Date(today.setDate(sat))
        ];
    }
}]);
