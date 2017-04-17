angular.module('businessController', ['businessOwnerServices','authServices'])

.controller('businessCtrl', function(Authentication, AuthenticationToken,$location, $rootScope,BusinessOwner){

	var app = this;
	
	app.dataReady = false;

	//app.isBusinessOwner = Authentication.isBusinessOwner();


	
	app.addMedia = function(uploadedData){
		
		app.errMsg = false;
		app.successMsg = false ;
		
		BusinessOwner.uploadMedia(app.uploadedData).then(function(data){
			if(data.data.success){
				app.successMsg = data.data.message;
				app.uploadedData= {};
				}
				
			
			else{

				app.errMsg = data.data.message;
			}
		});
	};
	

});