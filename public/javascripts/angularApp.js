var app = angular.module('fantasyFitness', ['ui.router', 'ui.bootstrap']);

app.controller('PostsCtrl', ['$scope', 'posts', 'post', 'auth', function($scope, posts, post, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.post = post;
	$scope.addComment = function(){
	  if($scope.body === '') { return; }
	  posts.addComment(post._id, {
	    body: $scope.body,
	    author: 'user'
	  }).success(function(comment) {
	    $scope.post.comments.push(comment);
	  });
	  $scope.body = '';
	};
	$scope.incrementUpvotes = function(comment){
  		posts.upvoteComment(post, comment);
	};
}]);

// POSTS SERVICE
app.factory('posts', ['$http', 'auth', function($http, auth) {
	var o = {posts:[]};
	o.get = function(id) {
	  return $http.get('/posts/' + id).then(function(res){
	    return res.data;
	  });
	};
	o.getAll = function() {
    	return $http.get('/posts').success(function(data){
      		angular.copy(data, o.posts);
    	});
  	};
  	o.create = function(post) {
	  return $http.post('/posts', post, {
	    headers: {Authorization: 'Bearer '+ auth.getToken()}
	  }).success(function(data){
	    o.posts.push(data);
	  });
	};

	o.upvote = function(post) {
	  return $http.put('/posts/' + post._id + '/upvote', null, {
	    headers: {Authorization: 'Bearer '+ auth.getToken()}
	  }).success(function(data){
	    post.upvotes += 1;
	  });
	};

	o.addComment = function(id, comment) {
	  return $http.post('/posts/' + id + '/comments', comment, {
	    headers: {Authorization: 'Bearer '+auth.getToken()}
	  });
	};

	o.upvoteComment = function(post, comment) {
	  return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', null, {
	    headers: {Authorization: 'Bearer '+auth.getToken()}
	  }).success(function(data){
	    comment.upvotes += 1;
	  });
	};
	return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
   	var auth = {};
   	auth.saveToken = function (token){
  		$window.localStorage['fantasy-fitness-token'] = token;
	};

	auth.getToken = function (){
	  	return $window.localStorage['fantasy-fitness-token'];
	};
	auth.isLoggedIn = function(){
	  var token = auth.getToken();

	  if(token){
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.exp > Date.now() / 1000;
	  } else {
	    return false;
	  }
	};
	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
	    var token = auth.getToken();
	    var payload = JSON.parse($window.atob(token.split('.')[1]));
	    return payload.username;
	  }
	};
	auth.getUserId = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload._id;
		}
	};
	auth.register = function(user) {
	  return $http.post('/register', user).success(function(data){
		  auth.saveToken(data.token);
	  }).error(function(err, req, res, next) {alert('auth.register (ERROR BLOCK) -- error: ' + err);});
	};
	auth.logIn = function(user){
	  return $http.post('/login', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};
	auth.logOut = function(){
  		$window.localStorage.removeItem('fantasy-fitness-token');
	};
  return auth;
}]);

app.service('FitlogService', ['$http', 'auth', function($http, auth) {
	this.createLog = function(fitlog) {
		return $http.post('/'+auth.getUserId()+'/fitlog', fitlog);
	};
	this.getLogs = function() {
		return $http.get('/'+auth.getUserId()+'/fitlog');
	};
	this.getLogById = function(logId) {
		return $http.get('/'+auth.getUserId()+'/fitlog/'+logId).then(function(res) {
			return res.data;
		});
	};
	this.saveLog = function(fitlog) {
		console.log('log id: ' + fitlog._id);
		return $http.put('/'+auth.getUserId()+'/fitlog/'+fitlog._id, fitlog).success(function() {
			console.log('success!!');
		}).error(function(err) {
			console.log('error!\n'+err);
		});
	};
}]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('home', {
		  url: '/home',
		  templateUrl: 'templates/home.html',
		  resolve: {
		    postPromise: ['posts', function(posts){
		      return posts.getAll();
		    }]
		  }
		})
		.state('scoreboard', {
			url: '/scoreboard',
			templateUrl: '/templates/scoreboard.html'
		})
		.state('tabatas', {
			url: '/tabatas',
			templateUrl: '/templates/tabatas.html'
		})
		.state('matchup', {
			url: '/matchup',
			templateUrl: '/templates/matchup.html'
		})
		.state('fitlog', {
			url: '/{id}/fitlog',
			templateUrl: '/templates/fitlog.html'
			//resolve: {
			//	worksheet: ['$stateParams', 'worksheets', function($stateParams, worksheets) {
			//		return worksheets.get($stateParams.id);
			//	}]
			//}
		})
		.state('posts', {
		  url: '/posts/{id}',
		  templateUrl: '/posts.html',
		  controller: 'PostsCtrl',
		  resolve: {
		    post: ['$stateParams', 'posts', function($stateParams, posts) {
		      return posts.get($stateParams.id);
		    }]
		  }
		})
		.state('login', {
		  url: '/login',
		  templateUrl: '/templates/login.html',
		  onEnter: ['$state', 'auth', function($state, auth){
		    if(auth.isLoggedIn()){
		      $state.go('home');
		    }
		  }]
		})
		.state('register', {
		  url: '/register',
		  templateUrl: '/templates/register.html',
		  onEnter: ['$state', 'auth', function($state, auth){
		    if(auth.isLoggedIn()){
		      $state.go('home');
		    }
		  }]
		});

	$urlRouterProvider.otherwise('home');

}]);