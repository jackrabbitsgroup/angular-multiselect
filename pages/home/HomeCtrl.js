/**
*/

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$scope', '$timeout', function($scope, $timeout) {
	$scope.selectVals =[];
	$scope.config ={};
	$scope.selectOpts =[
		{'val':1, 'name':'one'},
		{'val':2, 'name':'two'},
		{'val':3, 'name':'three'},
		{'val':4, 'name':'four'},
		{'val':5, 'name':'five'}
	];
	
	//to update options - NOTE: this must be done AFTER $scope is loaded - the below must be wrapped inside a callback or timeout so the $scope has time to load
	$timeout(function() {
		var optsNew =[
			{'val':1, 'name':'yes'},
			{'val':2, 'name':'no'},
			{'val':3, 'name':'maybe'}
		];
		// $scope.$broadcast('jrgMultiselectUpdateOpts', {'id':'select1', 'opts':optsNew});		//OUTDATED but still works
		$scope.selectOpts =optsNew;
	}, 500);

}]);