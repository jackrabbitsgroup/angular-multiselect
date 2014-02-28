/**
*/

'use strict';

angular.module('myApp').controller('LoadMoreCtrl', ['$scope', '$timeout', function($scope, $timeout) {
	$scope.selectVals =[];
	$scope.config ={};
	$scope.selectOpts =[
		{'val':'one', 'name':'One'},
		{'val':'two', 'name':'Two'},
		{'val':'three', 'name':'Three'},
		{'val':'four', 'name':'Four'},
		{'val':'five', 'name':'Five'}
	];
	
	//handle load more (callbacks)
	var itemsMore =
	[
		{'val':'mOne', 'name':'More One'},
		{'val':'mTwo', 'name':'More Two'},
		{'val':'mThree', 'name':'More Three'},
		{'val':'mFour', 'name':'More Four'},
		{'val':'mFive', 'name':'More Five'}
	];
	
	//@param params
	//	@param {String} searchText
	$scope.loadMore =function(params, callback) {
		console.log('loading more');
		//filter results
		var searchText =params.searchText.toLowerCase();
		var filteredOpts =[];
		var ii;
		for(ii =0; ii<itemsMore.length; ii++) {
			if(itemsMore[ii].name.toLowerCase().indexOf(searchText) >-1) {
				filteredOpts.push(itemsMore[ii]);
			}
		}
		callback({
			itemsMore: filteredOpts
		});
	};

}]);