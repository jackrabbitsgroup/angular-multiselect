/**
*/

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$scope', function($scope) {
	$scope.ngModel ='';
	$scope.opts ={
		pikaday: {
			//firstDay: 1,		//start on Monday
			showTime: true		//show timepicker as well
		}
	};

	$scope.validateDate =function(date, params, callback) {
		if(1) {
			callback(true);		//valid
		}
		else {
			callback(false);		//invalid
		}
	};

	$scope.onchangeDate =function(date, params) {
		console.log(date);
	};

}]);