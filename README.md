# AngularJS Multi Select Input Directive

## Why / When to use?
Why not just use the popular `select2` or `chosen` and/or their angular wrapper equivalents?

angular-multiselect has NO DEPENDENCIES - Including NO jQuery! Pure AngularJS!

Dependencies can have a large footprint and thus affect performance:
- jQuery 2.0.3 is 237kb, 82kb compressed
- chosen 1.0.0 is 40kb, 26kb compressed AND it requries jQuery (or Prototype) = <b>108kb</b> total
- select2 3.4.4 is 133kb, 60kb compressed AND it requires jQuery = <b>142kb</b> total
- angular-ui-select2 is only 7kb (uncompressed) by itself but requires select2 and jQuery = ~144kb total
	
angular-multiselect is 34kb, <b>12kb</b> compressed in TOTAL (since there are no other dependencies)!

So, IF you're already using jQuery anyway (in which case jQuery doesn't really add any additional footprint for multiselect as it's already there) and/or you want the more robust features that chosen/select2 offer, it's probably better to stick with select2/chosen. But if you're looking for a more lightweight multi select and are on your way to or have already completely eliminated jQuery from your Angular app, this will do the job nicely.


## Demo
http://jackrabbitsgroup.github.io/angular-multiselect/

## Dependencies
- `lesshat` (for multiselect.less)
See `bower.json` and `index.html` in the `gh-pages` branch for a full list / more details

## Install
1. download the files
	1. Bower
		1. add `"angular-multiselect": "latest"` to your `bower.json` file then run `bower install` OR run `bower install angular-multiselect`
2. include the files in your app
	1. multiselect.min.js
	2. multiselect.less
3. include the module in angular (i.e. in `app.js`) - `jackrabbitsgroup.angular-multiselect`

See the `gh-pages` branch, files `bower.json` and `index.html` for a full example.


## Documentation
See the `multiselect.js` file top comments for usage examples and documentation
https://github.com/jackrabbitsgroup/angular-multiselect/blob/master/multiselect.js