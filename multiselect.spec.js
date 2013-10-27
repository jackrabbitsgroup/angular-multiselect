describe('uiMultiselect', function () {
	var elm, scope, $compile, $timeout;
	var instId ='select1';
	/*
	//set up ids that should match the select input
	var ids ={
		dropdown: instId+"Dropdown"
	};
	*/
	
	beforeEach(module('ui'));
	
	/**
	@param params
	*/
	var createElm =function(params) {
		//NOTE: the leading / wrapping div is NECESSARY otherwise the html is blank.. not sure why.. i.e. if just start with <div ui-lookup... as the first div it will NOT work..
		var html ="<div>";
			html+="<div ui-multiselect id='"+instId+"' select-opts='selectOpts' ng-model='selectVals' config='config'></div>";
		html+="</div>";
		elm =angular.element(html);
		
		scope.selectVals =[];
		scope.config ={};
		scope.selectOpts =[
			{'val':1, 'name':'one'},
			{'val':2, 'name':'two'},
			{'val':3, 'name':'three'},
			{'val':4, 'name':'four'},
			{'val':5, 'name':'five'}
		];
		
		$compile(elm)(scope);
		scope.$digest();
	};
	
	beforeEach(inject(function(_$rootScope_, _$compile_, _$timeout_) {
		$compile = _$compile_;
		scope = _$rootScope_.$new();
		$timeout =_$timeout_;
	}));
	
	afterEach(function() {
		angular.module('ui.config').value('ui.config', {});		// cleanup
	});
	
	it('should compile correctly', function() {
		var ele1;
		createElm({});
		ele1 =elm.find('div.ui-multiselect-display-box');
		expect(ele1.length).toBeGreaterThan(0);
		ele1 =elm.find('div.ui-multiselect-dropdown-cont');
		expect(ele1.length).toBeGreaterThan(0);
	});
	
	/*
	//@todo
	//not sure how to do a timeout so this isn't working..
	it('should start with options dropdown hidden', function() {
		var ele1;
		createElm({});
		ele1 =elm.find('div.ui-multiselect-dropdown');
		expect(ele1.length).toBe(1);
		
		// scope.$apply();
		
		// setTimeout(function() {
		$timeout(function() {
			scope.$digest();
			scope.$apply();
			expect(ele1.eq(0).hasClass('hidden')).toBe(true);
		}, 1000);
		$timeout.flush();
		// expect(ele1.eq(0)).toHaveClass('hidden');
	});
	*/
	
	/*
	//@todo
	//not working... I don't understand how to write these tests to test the DOM.. the 'hidden' class won't get added no matter what I do.. 
	it('should hide options dropdown on blur', function() {
		var ele1;
		createElm({});
		eleDropdown =elm.find('div.ui-multiselect-dropdown');
		eleInput =elm.find('input.ui-multiselect-input');
		// expect(eleInput).toBe('');
		$(eleInput.eq(0)).blur();
		// scope.blurInput({});
		scope.$broadcast('uiMultiselectBlur', {});
		scope.$apply();
		scope.$digest();
		expect(eleDropdown.eq(0).hasClass('hidden')).toBe(true);
	});
	*/
	
	/*
	@todo - more tests once figure out how to write them...
	it('should have unique id for each select if inside an ng-repeat', function() {
	});
	
	it('should hide the dropdown when hit the TAB key', function() {
	});
	*/
	
});