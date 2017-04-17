//the frontend routes is an angular module, the config contains the directing
angular.module('appRoutes', ['ngRoute'])


.config(function($routeProvider, $locationProvider){

	$routeProvider
	.when('/', {
		templateUrl: 'app/views/pages/home.html',
		controller:'mainCtrl',
		controllerAs:'main'
	})
	
	.when('/register', {
		templateUrl: 'app/views/pages/users/register.html',
		controller: 'regCtrl',
		controllerAs: 'register'
	})
	//This returns the page used for searchResults
	//and assigns the controller to it
	.when('/search/search/:keyword',{
		templateUrl:'app/views/pages/search.html',
		controller: 'searchCtrl',
		controllerAs: 'search'
	})
	//This returns the page used for login
	//and assigns the controller to it
	.when('/loginPage',{
		templateUrl:'app/views/pages/clientorbusinesslogin.html',
		controller: 'mainCtrl',
		controllerAs: 'main'
	})

	.when('/gallery/gallery/:keyword',{
		templateUrl:'app/views/pages/gallery.html',
		controller: 'businessCtrl',
		controllerAs : 'business'
	})

	.when('/review/newReview', {
		templateUrl: 'app/views/pages/review/newReview.html',
		controller: 'reviewCtrl',
		controllerAs: 'review'
	})

	.otherwise({
		redirectTo: '/'
	})


	// to remove the hash
	$locationProvider.html5Mode({
        enabled: true,
        requiredBase: false
    });


});