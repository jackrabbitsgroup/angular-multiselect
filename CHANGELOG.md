Version numbers correspond to `bower.json` version (package.json files is NOT necessarily in sync)

# 1.0.9
## Bug Fixes
- avoid infinite loop of calling loadMore function repeatedly if no results come back

# 1.0.8
## Features
- add loadMore functionality so can add more items while searching (i.e. from backend / via AJAX)

# 1.0.7
## Bug Fixes
- clear selectedOpts in initNgModel function if blank ngModel

# 1.0.6
## Bug Fixes
- add initNgModel function and call on $watch('ngModel'..) to prevent ngModel from being undefined

# 1.0.5
## Bug Fixes
- prevent errors if select is hidden (i.e. from parent hidden)


# 1.0.4
- generate multiselect.css and multiselect.min.css for non-LESS support


# 1.0.3
## Bug Fixes
- add replace:true for new Angular 1.2.0 change to template function so there's not an extra wrapping <div> element


# 1.0.2
## Features
- update to be compatible with Angular 1.2.0 (switch to template function instead of compile)

# 1.0.1
## Breaking Changes
- update to LESSHat v2.0

# 1.0.0

## Features
		
## Bug Fixes

## Breaking Changes