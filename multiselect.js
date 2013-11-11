/**
@todo
- maybe
	- load more / calling function to load more opts & then update them (i.e. when scroll to bottom or click "more")
		- use timeout for searching more & auto search more if result isn't found in default/javascript/local opts

USAGE functions:
//to update options after it's been written / initialized:		//NOTE: this should NOT be necessary anymore as $watch is being used on opts
$scope.$broadcast('jrgMultiselectUpdateOpts', {'id':'select1', 'opts':optsNew});


Table of Contents
controller
//0. init vars, etc.
//15. $scope.focusInput
//16. $scope.keyupInput
//14. selectOpts
//11. filterOpts
//13. $scope.keydownInput
//6. $scope.clickInput
//7. $scope.selectOpt
//8. $scope.removeOpt
//8.5. removeDisplayOpt
//9. $scope.$on('jrgMultiselectUpdateOpts',..
//10. formOpts
//12. $scope.createNewOpt
	//12.5. createNewCheck
//0.5. init part 2 (after functions are declared) - select default options, etc.
//0.75. $scope.$watch('ngModel',.. - to update selected values on change
//0.8. $scope.$watch('selectOpts',..

jrgMultiselectData service
//1. init
//2. toggleDropdown
//3. getFocusCoords
//4. blurInput
//5. mouseInDiv


@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
	@param {Array} selectOpts options; each item is an object of:
		@param {String} val Value of this option
		@param {String} name text/html to display for this option
	@param {Mixed} ngModel
	@param {Object} config
		@param {Number} [createNew =0] int 1 or 0; 1 to allow creating a new option from what the user typed IF it doesn't already exist

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. scroll-load='1' NOT scrollLoad='1'
	@param {String} [id] Id for this element (required to use jrgMultiselectUpdateOpts event to update options)
	@param {String} [placeholder] text/prompt to show in input box
	@param {Number} [minLengthCreate =1] how many characters are required to be a valid new option
	@param {String} [onChangeEvt] event name to broadcast on change (or remove) options (replaces/instead of ng-change). Will be passed an object of:
		@param {Mixed} val The current value (of ng-model)


EXAMPLE usage:
partial / html:
	<div jrg-multiselect id='select1' select-opts='selectOpts' ng-model='selectVals' config='config'></div>

controller / js:
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

//end: EXAMPLE usage
*/

'use strict';

angular.module('jackrabbitsgroup.angular-multiselect', []).directive('jrgMultiselect', ['jrgMultiselectData', 'jrgLibArray', '$timeout', '$filter', function (jrgMultiselectData, libArray, $timeout, $filter) {

	return {
		priority: 100,		//must be below 500 to work with lFormInput directive
		scope: {
			selectOpts:'=',
			ngModel:'=',
			config:'='
		},

		compile: function(element, attrs) {
			var defaultsAttrs ={'placeholder':'Type to search', 'minLengthCreate':1,
				'debug':false		//true to show console.log messages
			};
			//attrs =angular.extend(defaultsAttrs, attrs);
			//attrs =libArray.extend(defaultsAttrs, attrs, {});
			//attrs =$.extend({}, defaultsAttrs, attrs);
			for(var xx in defaultsAttrs) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaultsAttrs[xx];
				}
			}
			
			//NOTE: must set id's using the scope since if use attrs.id(s) here and this directive is inside an ng-repeat, all instances will have the SAME id and this isn't allowed and will break things! It took a long time to figure out the right syntax and combination of compile, link, & controller function (as well as $timeout usage) to get this all to work (unique id's to be set, events to get registered properly on the correct id's, ng-repeat for filteredOpts to show up (doing $compile a 2nd time in the link function breaks the ng-repeat here..) etc.)
			var html ="<div>";
			html+="<div id='{{id}}' class='jrg-multiselect'>";
				html+="<div id='{{ids.displayBox}}' class='jrg-multiselect-display-box' ng-click='focusInput({})'>"+
					"<div id='{{ids.selectedOpts}}' class='jrg-multiselect-selected-opts'>"+
						"<div ng-repeat='opt in selectedOpts' class='jrg-multiselect-selected-opt'><div class='jrg-multiselect-selected-opt-remove' ng-click='removeOpt(opt, {})'>X</div> {{opt.name}}</div>"+
					"</div>"+
					"<div class='jrg-multiselect-input-div'>"+
						"<input id='{{ids.input}}' type='text' ng-change='filterOpts({})' placeholder='"+attrs.placeholder+"' class='jrg-multiselect-input' ng-model='modelInput' ng-click='clickInput({})' />"+
					"</div>"+
				"</div>"+
				"<div class='jrg-multiselect-dropdown-cont'>"+
					"<div id='{{ids.dropdown}}' class='jrg-multiselect-dropdown'>";
						//html+="<div class='jrg-multiselect-dropdown-opt' ng-repeat='opt in opts | filter:{name:modelInput, selected:\"0\"}' ng-click='selectOpt(opt, {})'>{{opt.name}}</div>";
						html+="<div class='jrg-multiselect-dropdown-opt' ng-repeat='opt in filteredOpts' ng-click='selectOpt(opt, {})'>{{opt.name}}</div>";
						// html+="filteredOpts.length: {{filteredOpts.length}}";
						html+="<div class='jrg-multiselect-dropdown-opt' ng-show='config1.createNew && createNewAllowed && filteredOpts.length <1' ng-click='createNewOpt({})'>[Create New]</div>"+
						"<div class='jrg-multiselect-dropdown-opt' ng-show='loadingOpt'>Loading..</div>";
					//opts will be built and stuff by writeOpts function later
					html+="</div>";
				html+="</div>";
			html+="</div>";
			html+="</div>";
			element.replaceWith(html);
			

			return function(scope, element, attrs, ngModel) {
				var xx;		//used in for loops later
				var defaultsAttrs ={'placeholder':'Type to search', 'minLengthCreate':1,
					'debug':false		//true to show console.log messages
				};
				//attrs =angular.extend(defaultsAttrs, attrs);
				//attrs =libArray.extend(defaultsAttrs, attrs, {});
				//attrs =$.extend({}, defaultsAttrs, attrs);
				for(xx in defaultsAttrs) {
					if(attrs[xx] ===undefined) {
						attrs[xx] =defaultsAttrs[xx];
					}
				}
				
				//IMPORTANT: set id's HERE (AFTER compile function) to ensure they're UNIQUE in case this directive is in an ng-repeat!!!
				// var oldId =attrs.id;
				attrs.id ="jrgMultiselect"+Math.random().toString(36).substring(7);
				
				attrs.ids ={
					'displayBox':attrs.id+"DisplayBox",
					'input':attrs.id+"Input",
					'dropdown':attrs.id+"Dropdown",
					'selectedOpts':attrs.id+"SelectedOpts",
					'selectedOpt':attrs.id+"SelectedOpt",
					'remove':attrs.id+"Remove",
					'opt':attrs.id+"Opt"
				};
				
				//put on scope since that's how id's are actually given to the elements (this is the ONLY way I could get this work and to have unique id's inside an ng-repeat..)
				scope.id =attrs.id;
				scope.ids =attrs.ids;
				
				jrgMultiselectData.data[attrs.id] ={
					'ids':attrs.ids,
					'opts':{},		//NOTE: options are passed in as [] but converted to object / associative array here
					'blurCoords':{'left':-1, 'right':-1, 'top':-1, 'bottom':-1},
					'skipBlur':false,		//trigger to avoid immediate close for things like clicking the input
					//'ngModel':attrs.ngModel,
					//'scope':scope,
					//'ngModel':ngModel,
					'lastSearchVal':'',		//default to blank
					'attrs':attrs,
					'maxWrite':25		//int of how many to stop writing after (for performance, rest are still searchable)
				};
				
				jrgMultiselectData.init({});
				
				
				
				//used to be in controller but timing is off and controller seems to be executed BEFORE this link function so the attrs.id is not updated yet... so had to move everything from the controller into the link function..
				//0. init vars, etc.
				
				scope.config1 ={};		//can't use scope.config in case it's not defined/set otherwise get "Non-assignable model expression.." error..
				var defaultConfig ={
					createNew: 0
				};
				if(!scope.config || scope.config ===undefined) {
					scope.config1 =defaultConfig;
				}
				else {		//extend defaults
					for(xx in defaultConfig) {
						if(scope.config[xx] ===undefined) {
							scope.config1[xx] =defaultConfig[xx];
						}
						else {
							scope.config1[xx] =scope.config[xx];
						}
					}
				}
			
				if(scope.ngModel ===undefined) {
					scope.ngModel =[];
				}
				else if(typeof(scope.ngModel) =='string') {		//convert to array
					scope.ngModel =[scope.ngModel];
				}
				if(scope.options ===undefined) {
					scope.options ={};
				}
				scope.modelInput ='';
				scope.loadingOpt =false;
				scope.createNewAllowed =true;		//will be true if create new is currently allowed (i.e. if no duplicate options that already exist with the current input value)
				
				var keycodes ={
					'enter':13,
					'tab':9
				};
				
				//define timings for $timeout's, which must be precise to work properly (so events fire in the correct order)
				//@todo - fix this so it works 100% of the time - sometimes the options dropdown will close 
				var evtTimings ={
					'selectOptBlurReset':225,		//must be LONGER than onBlurDelay to keep options displayed after select one
					'clickInputBlurReset':225,
					'onBlurDelay':125		//this must be long enough to ensure the selectOpts click function fires BEFORE this (otherwise the options dropdown will close BEFORE the click event fires and the option will NOT be selected at all..
				};
				
				/**
				Form object {} of all options by category; start with just one - the default select opts. This is to allow multiple different types of opts to be used/loaded (i.e. when loading more results from AJAX or when user creates a new option) so can differentiate them and append to/update or show only certain categories of options. All these categories are later merged into one scope.opts array for actual use.
				@property optsList
				@type Object
				*/
				var optsList ={
					'default':libArray.copyArray(scope.selectOpts, {})
				};
				
				/**
				@property scope.opts A list of ALL options (combines all optsList categories into one final array of all options). Also adds a few extra key properties to each option, such as "selected". Each item is an object with the following properties detailed below.
					@param {Mixed} val The value of the option
					@param {String} name The display value (the text to display)
					@param {String} selected "0" if this option is not selected, "1" if this option is currently selected
				@type Array
				*/
				scope.opts =[];
				
				/**
				@property scope.filteredOpts The subset of scope.opts that match the search criteria AND are not already selected. These are formed in the scope.filterOpts function.
				@type Array
				*/
				scope.filteredOpts =[];
				
				/**
				@property scope.selectedOpts The displayed selected options (a subset of 
				@type Array
				*/
				scope.selectedOpts =[];		//start with none selected

				
				
				//need timeout otherwise element isn't defined yet and events won't be registered..
				$timeout(function() {
					//get focus coords for toggling dropdown on blur and then hide dropdown
					// console.log('setting focus, blur, etc. id: '+attrs.id+' jrgMultiselectData.data[attrs.id].ids.input: '+jrgMultiselectData.data[attrs.id].ids.input);
					jrgMultiselectData.getFocusCoords(attrs.id, {});		//BEFORE dropdown is hidden, get coords so can handle blur
					jrgMultiselectData.toggleDropdown(attrs.id, {'hide':true});		//start dropdown hidden
					
					//UPDATE2 - keyup wasn't working since TAB doesn't fire keyup reliably..
					//UPDATE: 2013.05.13 - using keyup to handle tab character since TAB will ALWAYS be for a blur so don't need to worry about the timing issues - can just close it immediately
					//trying to get blur to work but timing seems tricky - firing in wrong order (blur is going before click input..) so need timeout to fix the order
					angular.element(document.getElementById(jrgMultiselectData.data[attrs.id].ids.input)).bind('blur', function(evt) {
						$timeout(function() {
							if(!jrgMultiselectData.data[attrs.id].skipBlur) {		//only blur if not trying to skip it
								if(attrs.debug) {
									console.log('skipBlur: '+jrgMultiselectData.data[attrs.id].skipBlur);
								}
								jrgMultiselectData.blurInput(attrs.id, {});
							}
						}, evtTimings.onBlurDelay);
					});
					
					angular.element(document.getElementById(jrgMultiselectData.data[attrs.id].ids.input)).bind('keyup', function(evt) {
						//if(evt.keyCode ==keycodes.tab) {		//if tab character, blur the options
						if(0) {		//UPDATE: 2013.05.13 - TAB character doesn't seem to consistently fire.. but blur does.. so use blur instead..
							if(attrs.debug) {
								console.log('skipBlur: '+jrgMultiselectData.data[attrs.id].skipBlur);
							}
							jrgMultiselectData.blurInput(attrs.id, {});
						}
						else {		//handle other key inputs (i.e. enter key to select option)
							scope.keydownInput(evt, {});
						}
					});
				}, 50);
				
				//15.
				scope.focusInput =function(params) {
					document.getElementById(jrgMultiselectData.data[attrs.id].ids.input).focus();
					scope.clickInput({});
				};
				
				/**
				UPDATE: 2013.05.13 - does NOT work all the time so no longer using it. When had another form on the page this wouldn't fire at all.. ui-keypress may have a bug??!
				Handles hitting tab on input to blur it
				@toc 16.
				@method scope.keyupInput
				@param {Object} params
				*/
				/*
				scope.keyupInput =function(params) {
					console.log('keyupTabInput');
					if(!jrgMultiselectData.data[attrs.id].skipBlur) {
						jrgMultiselectData.blurInput(attrs.id, {});
					}
				};
				*/
				
				
				//14.
				/*
				@param optsArray =array [] of option values to select (will go through al the options and match the values to them then call the "selectOpt" function for each one that's matched)
				@param params
				*/
				function selectOpts(optsArray, params) {
					for(var ii=0; ii<optsArray.length; ii++) {
						for(var xx in optsList) {		//go through each type and search for match (break once get the first one)
							var index1 =libArray.findArrayIndex(optsList[xx], 'val', optsArray[ii], {});
							if(index1 >-1) {		//found it
								scope.selectOpt(optsList[xx][index1], {});
								break;		//don't bother searching the other option types
							}
						}
					}
				}
				
				/**
				Removes either all or a subset of selected values (and updates display as well to remove options)
				@toc 17.
				@method removeOpts
				@param {Object}
					@param {Array} [valsToRemove] The values of the options to remove (i.e. that match scope.ngModel)
					@param {Boolean} [displayOnly] True to only remove the option from the selected array / DOM (i.e. if coming from an ngModel $watch call and the ngModel has already been updated, in which case ONLY want to update the display values as the model has already been updated)
					// @param {Boolean} [all] True to remove ALL selected values (based on scope.ngModel) and displayed options
				*/
				function removeOpts(params) {
					var defaults ={
						displayOnly: false
					};
					//extend defaults
					var xx;
					for(xx in defaults) {
						if(params[xx] ===undefined) {
							params[xx] =defaults[xx];
						}
					}
					if(params.valsToRemove !==undefined && params.valsToRemove.length >0) {
						var ii;
						for(ii =0; ii<params.valsToRemove.length; ii++) {
							//find full opt object in scope.opts
							var index1 =libArray.findArrayIndex(scope.opts, 'val', params.valsToRemove[ii], {});
							if(index1 >-1) {		//if found, remove it. It's important to pass in the full option from scope.opts
								if(params.displayOnly) {
									removeDisplayOpt(scope.opts[index1], {bulkRemove: true});
								}
								else {
									scope.removeOpt(scope.opts[index1], {bulkRemove: true});
								}
							}
						}
						//re-filter now that all options are updated
						scope.filterOpts({});
					}
				}
				
				//13.
				scope.keydownInput =function(evt, params) {
					if(evt.keyCode ==keycodes.enter) {
						//alert("enter");
						if(scope.filteredOpts.length >0) {		//select first one
							scope.selectOpt(scope.filteredOpts[0], {});
						}
						else if(scope.config1.createNew) {		//create new
							scope.createNewOpt({});
						}
					}
				};
				
				//11.
				scope.filterOpts =function(params) {
					scope.filteredOpts =$filter('filter')(scope.opts, {name:scope.modelInput, selected:"0"});
					if(scope.filteredOpts.length <1) {
						if(scope.config1.createNew && createNewCheck({}) ) {
							scope.createNewAllowed =true;
						}
						else {
							scope.createNewAllowed =false;
						}
					}
				};
				
				//6.
				scope.clickInput =function(params) {
					scope.filterOpts({});
					jrgMultiselectData.data[attrs.id].skipBlur =true;		//avoid immediate closing from document click handler
					jrgMultiselectData.toggleDropdown(attrs.id, {'show':true});
					//fail safe to clear skip blur trigger (sometimes it doesn't get immediately called..)
					$timeout(function() {
						jrgMultiselectData.data[attrs.id].skipBlur =false;		//reset
						if(attrs.debug) {
							console.log('clickInput skipBlur reset, skipBlur: '+jrgMultiselectData.data[attrs.id].skipBlur);
						}
					}, evtTimings.clickInputBlurReset);
				};
				
				//7.
				scope.selectOpt =function(opt, params) {
					var valChanged =false;		//track if something actually changed (other than just display)
					//alert(opt.name);
					jrgMultiselectData.data[attrs.id].skipBlur =true;		//avoid immediate closing from document click handler
					if(attrs.debug) {
						console.log('selectOpt. skipBlur: '+jrgMultiselectData.data[attrs.id].skipBlur);
					}
					$timeout(function() {
						jrgMultiselectData.data[attrs.id].skipBlur =false;		//reset
						if(attrs.debug) {
							console.log('selectOpt skipBlur reset, skipBlur: '+jrgMultiselectData.data[attrs.id].skipBlur);
						}
					}, evtTimings.selectOptBlurReset);
					var index1;
					index1 =libArray.findArrayIndex(scope.ngModel, '', opt.val, {'oneD':true});
					if(index1 <0) {
						scope.ngModel.push(opt.val);
						valChanged =true;
					}
					//check opt display separately (i.e. if initing values)
					//var index1 =libArray.findArrayIndex(scope.selectedOpts, '', opt.val, {'oneD':true});
					index1 =libArray.findArrayIndex(scope.selectedOpts, 'val', opt.val, {});
					if(index1 <0) {
						opt.selected ="1";
						scope.selectedOpts.push(opt);
					}
					//reset search key & refocus on input
					scope.modelInput ='';		//reset
					document.getElementById(jrgMultiselectData.data[attrs.id].ids.input).focus();
					//jrgMultiselectData.toggleDropdown(attrs.id, {'show':true});
					scope.filterOpts({});
					if(valChanged) {
						if(attrs.onChangeEvt !==undefined) {
							scope.$emit(attrs.onChangeEvt, {'val':scope.ngModel});
						}
					}
				};
				
				/**
				@toc 8.
				@param {Object} opt Object with option info. This MUST be a subset (one particular option item) of scope.opts as it's properties will be directly updated and are expected to update the scope.opts array accordingly.
					@param {Mixed} val Value to remove
				@param {Object} params
					@param {Boolean} bulkRemove True if this function is being called in a loop so just want to remove the option and do the bare minimum (i.e. for performance, won't call scope.filterOpts each time - the calling function will be responsible for calling this ONCE at the end of the loop)
				*/
				scope.removeOpt =function(opt, params) {
					var valChanged =false;
					var index1;
					index1 =libArray.findArrayIndex(scope.ngModel, '', opt.val, {'oneD':true});
					if(index1 >-1) {
						valChanged =true;
						scope.ngModel.splice(index1, 1);
						
						removeDisplayOpt(opt, params);
					}
					
					if(valChanged) {
						if(attrs.onChangeEvt !==undefined) {
							scope.$emit(attrs.onChangeEvt, {'val':scope.ngModel});
						}
					}
				};
				
				/**
				This removes a (selected) option from the scope.selectedOpts array (thus updating the DOM). It also re-filters the options by calling scope.filterOpts
				@toc 8.5.
				@method removeDisplayOpt
				@param {Object} opt Object with option info. This MUST be a subset (one particular option item) of scope.opts as it's properties will be directly updated and are expected to update the scope.opts array accordingly.
					@param {Mixed} val Value to remove
				@param {Object} params
					@param {Boolean} bulkRemove True if this function is being called in a loop so just want to remove the option and do the bare minimum (i.e. for performance, won't call scope.filterOpts each time - the calling function will be responsible for calling this ONCE at the end of the loop)
				*/
				function removeDisplayOpt(opt, params) {
					opt.selected ="0";
					//remove from selected opts array
					var index1 =libArray.findArrayIndex(scope.selectedOpts, 'val', opt.val, {});
					if(index1 >-1) {
						scope.selectedOpts.splice(index1, 1);
					}
					if(params.bulkRemove ===undefined || !params.bulkRemove) {
						scope.filterOpts({});
					}
				}
				
				//9.
				/*
				@param params
					id (required) =instance id for this directive (to indentify which select to update opts for); must match the "id" attribute declared on this directive
					opts (required) =array []{} of opts to update/add
					type (defaults to 'default') =string of which optsList to add/update these to
					replace (default true) =boolean true if these new opts will overwrite existing ones of this type (if false, they'll just be appended to the existing ones - NOTE: new opts should not conflict with existing ones; don't pass in any duplicates as these are NOT checked for here)
				*/
				scope.$on('jrgMultiselectUpdateOpts', function(evt, params) {
					if(params.id ==attrs.id) {		//scope.$on will be called on EVERY instance BUT only want to update ONE of them
						var defaults ={'type':'default', 'replace':true};
						params =angular.extend(defaults, params);
						if(optsList[params.type] ===undefined || params.replace ===true) {
							optsList[params.type] =params.opts;
						}
						else {
							optsList[params.type] =optsList[params.type].concat(params.opts);
						}
						formOpts({});		//re-form opts with the new ones
						selectOpts(scope.ngModel, {});
					}
				});
				
				//10.
				/*
				concats all types in optsList into a final set of options to be selected from / displayed
				@param params
					//unselectAll =boolean true to unselect all opts as well
					keys (optional) =array [] of which optsList keys to copy over; otherwise all will be copied over
				*/
				function formOpts(params) {
					var keys, ii;
					if(params.keys !==undefined) {
						keys =params.keys;
					}
					else {		//copy them all
						keys =[];
						var counter =0;
						for(var xx in optsList) {
							keys[counter] =xx;
							counter++;
						}
					}
					scope.opts =[];		//reset first
					for(ii =0; ii<keys.length; ii++) {
						scope.opts =scope.opts.concat(optsList[keys[ii]]);
					}
					
					//add some keys to each opt
					for(ii =0; ii<scope.opts.length; ii++) {
						var index1 =libArray.findArrayIndex(scope.selectedOpts, 'val', scope.opts[ii].val, {});
						if(index1 <0) {		//if not selected
							scope.opts[ii].selected ="0";		//start visible
						}
					}
				}
				
				//12.
				scope.createNewOpt =function(params) {
					if(createNewCheck({})) {
						if(optsList.created ===undefined) {
							optsList.created =[];
						}
						//var curIndex =optsList.created.length;
						var newOpt ={'val':scope.modelInput, 'name':scope.modelInput, 'selected':'0'};
						optsList.created[optsList.created.length] =newOpt;
						formOpts({});		//re-form opts with the new ones
						//select this opt
						scope.selectOpt(newOpt, {});
					}
				};
				
				//12.5.
				function createNewCheck(params) {
					var valid =false;
					var val =scope.modelInput;
					if(val.length >=attrs.minLengthCreate) {
						//make sure this value doesn't already exist
						var index1 =libArray.findArrayIndex(scope.opts, 'val', val, {});
						if(index1 <0) {		//if doesn't already exist
							valid =true;
						}
					}
					return valid;
				}
				
				//0.5.
				//copy default (passed in) opts to final / combined (searchable) opts
				formOpts({});
				//select default opts
				selectOpts(scope.ngModel, {});
				
				//0.75.
				scope.$watch('ngModel', function(newVal, oldVal) {
					//if(newVal !=oldVal) {
					//if(1) {		//comparing equality on arrays doesn't work well..
					if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
						removeOpts({valsToRemove: oldVal, displayOnly:true});		//remove old values first
						selectOpts(scope.ngModel, {});
					}
				});
				
				//0.8.
				scope.$watch('selectOpts', function(newVal, oldVal) {
					if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
						optsList['default'] =newVal;
						formOpts({});		//re-form opts with the new ones
						selectOpts(scope.ngModel, {});
					}
				});
			};
		}
		
		/*
		controller: function($scope, $element, $attrs, $transclude) {
			
		}
		*/
	};
}])
.factory('jrgMultiselectData', ['jrgLibArray', '$rootScope', function(libArray, $rootScope) {
var inst ={
	data: {}, //data object for each select is created in compile function above - one per instance id
	
	timeout:{
		'searchOpts': {
			'trig':false,
			'delay':250
		}
	},
	
	inited:false,
	
	//1.
	init: function(params) {
		if(!this.inited) {
			var thisObj =this;
			document.onclick =function(evt) {
				for(var xx in thisObj.data) {
					var instId =xx;
					if(thisObj.data[instId].blurCoords.top >-1) {		//if it's been initialized
						if(!thisObj.mouseInDiv(evt, '', {'coords':thisObj.data[instId].blurCoords})) {
							//alert("document click out: "+ee.pageX+" "+ee.pageY);
							thisObj.blurInput(instId, {});
						}
					}
				}
			};
			
			this.inited =true;
		}
	},
	
	//2.
	/*
	@param params
		hide =boolean true to hide it
		show =boolean true to show it
	*/
	toggleDropdown: function(instId, params) {
		var id1 =this.data[instId].ids.dropdown;
		var ele =document.getElementById(id1);
		if(params.hide ===true) {
			angular.element(ele).addClass('hidden');
		}
		else {
			angular.element(ele).removeClass('hidden');
		}
	},
	
	//3.
	getFocusCoords: function(instId, params) {
		var ids ={'displayBox':this.data[instId].ids.displayBox, 'dropdown':this.data[instId].ids.dropdown};
		var eles ={};
		eles.displayBox =angular.element(document.getElementById(this.data[instId].ids.displayBox));
		eles.dropdown =angular.element(document.getElementById(this.data[instId].ids.dropdown));
		
		this.toggleDropdown(instId, {'show':true});		//required otherwise sometimes it won't be correct..

		var top1 =0, left1 =0, right1 =0, bottom1 =0;
		if(!eles.displayBox.prop('offsetTop') || !eles.dropdown.prop('offsetTop')) {
			console.log('getFocusCoords prop offset null..');		//is null in Testacular...
		}
		else {
			top1 =eles.displayBox.prop('offsetTop');
			left1 =eles.displayBox.prop('offsetLeft');
			//bottom1 =0;
			bottom1 =eles.dropdown.prop('offsetTop') +eles.dropdown.prop('offsetHeight');
			right1 =left1 +eles.displayBox.prop('offsetWidth');
		}
		
		this.data[instId].blurCoords ={'left':left1, 'right':right1, 'top':top1, 'bottom':bottom1};
		//console.log("blur coords: left: "+this.data[instId].blurCoords.left+" right: "+this.data[instId].blurCoords.right+" top: "+this.data[instId].blurCoords.top+" bottom: "+this.data[instId].blurCoords.bottom);

		this.toggleDropdown(instId, {'hide':true});		//revert
	},
	
	//4.
	blurInput: function(instId, params) {
		if(!this.data[instId].skipBlur) {
			//console.debug('blurring '+instId);
			this.toggleDropdown(instId, {'hide':true});
			if(this.data[instId].attrs.debug) {
				console.log('blurInput reset, skipBlur: '+this.data[instId].skipBlur);
			}
		}
		// this.data[instId].skipBlur =false;		//reset
		// if(this.data[instId].attrs.debug) {
			// console.log('blurInput reset, skipBlur: '+this.data[instId].skipBlur);
		// }
	},
	
	//5.
	/*
	//Figure out if the mouse is within the area of the input and/or dropdown at the time of this event (usually a click/touch)
	@param ee =dom event
	@param instId
	@param params
		coords =1D array of 'left', 'top', 'right', 'bottom' (all integers of pixel positions)
	@return boolean true if mouse is in div/coords
	*/
	mouseInDiv: function(ee, instId, params) {
		var coords;
		if(params.coords) {
			coords =params.coords;
		}
		else
		{
			var ele1 =angular.element(document.getElementById(instId));
			var left1 =ele1.prop('offsetLeft');
			var top1 =ele1.prop('offsetTop');
			var bottom1 =top1 +ele1.prop('offsetHeight');
			var right1 =left1 +ele1.prop('offsetWidth');
			coords ={'left':left1, 'top':top1, 'bottom':bottom1, 'right':right1};
		}
		//if(1)		//doesn't work - ee doesn't have a pageX & pageY from blur
		if(ee.pageX >=coords.left && ee.pageX <=coords.right && ee.pageY >=coords.top && ee.pageY <=coords.bottom)
		{
			return true;
		}
		else
		{
			//alert(inputId+" COORDS: "+coords['left']+" "+ee.pageX+" "+coords['right']+" "+coords['top']+" "+ee.pageY+" "+coords['bottom']);
			return false;
		}
	}
};
return inst;
}])
.factory('jrgLibArray', [function() {
var inst ={

	//9.
	/*
	distinguishes between an object/hash (i.e. {'key':'val'}) and (scalar) array (i.e. [1, 2, 3])
	*/
	isArray: function(array1, params) {
	/*	Cannot detect that a scalar array with an undefined first entry is an array
		if(typeof(array1) !='string' && (array1.length !=undefined && (typeof(array1) !='object' || array1[0] !=undefined || array1.length ===0)))	{		//have to ALSO check not object since it could be an object with a "length" key!... update - typeof is object sometimes for arrays??! so now checking array1[0] too/alternatively..
			return true;
		}
	*/
		if(Object.prototype.toString.apply(array1) === "[object Array]")
		{
			return true;
		}
		else {
			return false;
		}
	},
	
	//4.
	/*!
	//TO DO - copying issue where scalar array is being converted to object..?
	By default, arrays/objects are assigned by REFERENCE rather than by value (so var newArray =oldArray means that if you update newArray later, it will update oldArray as well, which can lead to some big problems later). So this function makes a copy by VALUE of an array without these backwards overwriting issues
	Recursive function so can hog memory/performance easily so set "skip keys" when possible
	@param array1 =array/object to copy
	@param params
		skipKeys =1D array of keys to NOT copy (currently only for associative array - wouldn't make a ton of sense otherwise?)
	@return newArray =array/object that has been copied by value
	*/
	copyArray: function(array1, params)
	{
		var newArray, aa;
		if(!array1) {		//to avoid errors if null
			return array1;
		}
		if(!params)
			params ={};
		if(!params.skipKeys || params.skipKeys ===undefined)
			params.skipKeys =[];
		if(typeof(array1) !="object")		//in case it's not an array, just return itself (the value)
			return array1;
		if(this.isArray(array1))
		{
			newArray =[];
			for(aa=0; aa<array1.length; aa++)
			{
				if(array1[aa] && (typeof(array1[aa]) =="object"))
					newArray[aa] =this.copyArray(array1[aa], params);		//recursive call
				else
					newArray[aa] =array1[aa];
			}
		}
		else		//associative array)
		{
			newArray ={};
			for(aa in array1)
			{
				var goTrig =true;
				for(var ss =0; ss<params.skipKeys.length; ss++)
				{
					if(params.skipKeys[ss] ==aa)
					{
						goTrig =false;
						break;
					}
				}
				if(goTrig)
				{
					if(array1[aa] && (typeof(array1[aa]) =="object"))
						newArray[aa] =this.copyArray(array1[aa], params);		//recursive call
					else
						newArray[aa] =array1[aa];
				}
			}
		}
		return newArray;
	},
	
	//1.
	/*
	Returns the index of an 2D []{} associative array when given the key & value to search for within the array
	@param array =2D array []{} to search
	@param key =associative key to check value against
	@param val
	@param params
		oneD =boolean true if it's a 1D array
	*/
	findArrayIndex: function(array, key, val, params)
	{
		var ii;
		//var index =false;		//index can be 0, which evaluates to false
		var index =-1;
		if(params.oneD)
		{
			for(ii=0; ii<array.length; ii++)
			{
				if(array[ii] ==val)
				{
					index =ii;
					break;
				}
			}
		}
		else
		{
			for(ii=0; ii<array.length; ii++)
			{
				if(array[ii][key] ==val)
				{
					index =ii;
					break;
				}
			}
		}
		return index;
	}
	
};
return inst;
}])
;