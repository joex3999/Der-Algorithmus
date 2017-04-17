angular.module('businessOwnerServices', [])

.factory('BusinessOwner', function($http,$routeParams)
{
	//This function calls the backend function that performs the search
	//then it returns the results to the controller.
	businessOwnerFactory = {};
	
	businessOwnerFactory.getResults = function(){
		
		return $http.get('/search/'+$routeParams.keyword);
	}

	businessOwnerFactory.uploadMedia = function(uploadedData){
		return $http.post('/gallery/'+$routeParams.keyword);
	}

	return businessOwnerFactory;
})
