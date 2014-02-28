/**
@toc
1. setup - whitelist, appPath, html5Mode
*/

'use strict';

angular.module('myApp', [
'ngRoute', 'ngSanitize', 'ngTouch', 'ngAnimate',		//additional angular modules
'jackrabbitsgroup.angular-multiselect'
]).
config(['$routeProvider', '$locationProvider', '$compileProvider', function($routeProvider, $locationProvider, $compileProvider) {
	/**
	setup - whitelist, appPath, html5Mode
	@toc 1.
	*/
	$locationProvider.html5Mode(false);		//can't use this with github pages / if don't have access to the server
	
	// var staticPath ='/';
	var staticPath;
	// staticPath ='/angular-directives/angular-multiselect/';		//local
	staticPath ='/';		//nodejs (local)
	staticPath ='/angular-multiselect/';		//gh-pages
	var appPathRoute =staticPath;
	var pagesPath =staticPath+'pages/';
	
	
	$routeProvider.when(appPathRoute+'home', {templateUrl: pagesPath+'home/home.html'});
	
	$routeProvider.when(appPathRoute+'basic', {templateUrl: pagesPath+'basic/basic.html'});
	$routeProvider.when(appPathRoute+'load-more', {templateUrl: pagesPath+'loadMore/load-more.html'});

	$routeProvider.otherwise({redirectTo: appPathRoute+'home'});
	
}]);