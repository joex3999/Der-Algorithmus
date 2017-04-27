//the userApp is just a module, which contains as dependencies all other controllers
angular.module('userApp', ['appRoutes', 'applicationFormController', 'applicationsController', 'applicationController', 'applicationServices', 'locationsController', 'businessOwnerInfoController', 'passwordController','reservationController', 'userControllers', 'reservationServices','userServices', 'ngAnimate','ngTouch', 'mainController', 'authServices', 'reviewController', 'reviewServices','businessOwnerServices','businessOwnerController','commentController','pagingServices', 'ui.bootstrap', 'activityController', 'activityServices', 'ratingController', 'adminBusinessController' , 'adminServices', 'viewReviewController','modalDialog','businessActivitiesController','businessActivitiesServices','nonRepeatableActivityFormController','repeatableActivityFormController','nonRepeatableReservationsController','nonRepeatableReservationsServices','repeatableReservationsController','repeatableReservationsServices', 'myReviewsController' ,'RegisterationFormCtrl'])

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptors');
});
