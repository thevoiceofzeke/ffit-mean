var app = angular.module('fantasyFitness')
    .config(['$stateProvider', function($stateProvider) {

    }])
    .controller('HomeCtrl', ['$scope', 'posts', 'auth', function($scope, posts, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;


        //$scope.posts = posts.posts;
        //$scope.test = 'hello';
        //$scope.addPost = function() {
        //    if(!$scope.title || $scope.title === '') { return; }
        //    posts.create({
        //        title: $scope.title,
        //        link: $scope.link
        //    });
        //    $scope.title = '';
        //    $scope.link = '';
        //};
        //$scope.incrementUpvotes = function(post) {
        //    posts.upvote(post);
        //};
}]);

