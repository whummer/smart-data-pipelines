/**
 * global configurations for requirejs
 */
var requirejsAppConfig = {
	baseUrl: 'scripts',
	name: 'scripts/init.js',
	out: 'scripts/riots-all.js',
	packages: [
		{
			name: 'riots',
			location: appConfig['appRootPath'] + '/scripts/modules/'
		}, {
			name: 'app',
			location: appConfig['appRootPath'] + '/scripts',
			main: 'app',
			excludeFromOptimize: true
		}, {
			name: 'routes',
			location: appConfig['appRootPath'] + '/scripts',
			main: 'routes',
			excludeFromOptimize: true
		}, {
			name: 'auth',
			location: appConfig['appRootPath'] + '/scripts/modules',
			main: 'auth.js',
			excludeFromOptimize: true
		}, {
			/* needs to go here, otherwise the production app tries to
			 request image files from /bower_components */
			name: 'raty',
			location: appConfig['appRootPath'] + '/scripts/ext/raty/',
			main: 'lib/jquery.raty',
			excludeFromOptimize: true
		}, {
			name: 'ng-file-upload',
			location: appConfig['appRootPath'] + '/scripts/ext/ng-file-upload',
			main: 'angular-file-upload',
			excludeFromOptimize: true
		},

		/* dependencies in /bower_components */

		{
			name: 'angular-bootstrap',
			location: appConfig['bowerRootPath'] + '/angular-bootstrap',
			main: 'ui-bootstrap-tpls'
		}, {
			name: 'bootstrap',
			location: appConfig['bowerRootPath'] + '/bootstrap',
			main: 'dist/js/bootstrap.min'
		}, {
			name: 'leaflet',
			location: appConfig['bowerRootPath'] + '/leaflet/',
			main: 'dist/leaflet-src'
		}, {
			name: 'moment',
			location: appConfig['bowerRootPath'] + '/moment/',
			main: 'min/moment.min'
		}, {
			name: 'hello',
			location: appConfig['bowerRootPath'] + '/hello',
			main: 'dist/hello.all'
		}, {
			name: 'sockjs',
			location: appConfig['bowerRootPath'] + '/sockjs',
			main: 'sockjs'
		}, {
			name: 'stomp-websocket',
			location: appConfig['bowerRootPath'] + '/stomp-websocket',
			main: 'lib/stomp'
		}, {
			name: 'angular-growl',
			location: appConfig['bowerRootPath'] + '/angular-growl-v2',
			main: 'build/angular-growl'
		}, {
			name: 'angular-ui-grid',
			location: appConfig['bowerRootPath'] + '/angular-ui-grid',
			main: 'ui-grid'
		}, {
			name: 'bootstrap-tagsinput',
			location: appConfig['bowerRootPath'] + '/bootstrap-tagsinput',
			main: 'dist/bootstrap-tagsinput'
		}, {
			name: 'prettify',
			location: appConfig['bowerRootPath'] + '/google-code-prettify',
			main: 'bin/prettify.min'
		}, {
			name: 'typeahead',
			location: appConfig['bowerRootPath'] + '/typeahead.js',
			main: 'dist/typeahead.bundle'
		}, {
			name: 'infinite-scroll',
			location: appConfig['bowerRootPath'] + '/ngInfiniteScroll',
			main: 'build/ng-infinite-scroll.min'
		}, {
			name: 'angular-hotkeys',
			location: appConfig['bowerRootPath'] + '/angular-hotkeys',
			main: 'build/hotkeys.min'
		}, {
			name: 'angular-animate',
			location: appConfig['bowerRootPath'] + '/angular-animate',
			main: 'angular-animate'
		}, {
			name: 'chartjs',
			location: appConfig['bowerRootPath'] + '/chartjs/',
			main: 'Chart.min'
		}, {
			name: 'metisMenu',
			location: appConfig['bowerRootPath'] + '/metisMenu/',
			main: 'dist/metisMenu.min'
		}, {
			name: 'iCheck',
			location: appConfig['bowerRootPath'] + '/jquery-icheck/',
			main: 'icheck.min'
		}, {
			name: 'slimscroll',
			location: appConfig['bowerRootPath'] + '/slimscroll/',
			main: 'jquery.slimscroll.min'
		}, {
			name: 'jasny-bootstrap',
			location: appConfig['bowerRootPath'] + '/jasny-bootstrap/',
			main: 'dist/js/jasny-bootstrap.min'
		}, {
			name: 'angular-ui-tree',
			location: appConfig['bowerRootPath'] + '/angular-ui-tree/',
			main: 'dist/angular-ui-tree.min'
		}, {
			name: 'angular-notify',
			location: appConfig['bowerRootPath'] + '/angular-notify/',
			main: 'dist/angular-notify.min'
		}, {
			name: 'angular-bootstrap-checkbox',
			location: appConfig['bowerRootPath'] + '/angular-bootstrap-checkbox/',
			main: 'angular-bootstrap-checkbox'
		}, {
			name: 'fancybox',
			location: appConfig['bowerRootPath'] + '/fancybox',
			main: 'source/jquery.fancybox.pack'
		}, {
			name: 'jvectormap',
			location: appConfig['bowerRootPath'] + '/jvectormap',
			main: 'jquery-jvectormap'
		}, {
			name: 'd3',
			location: appConfig['bowerRootPath'] + '/d3',
			main: 'd3.min'
		}, {
			name: 'jquery-knob',
			location: appConfig['bowerRootPath'] + '/jquery-knob',
			main: 'js/jquery.knob'
		}, {
			name: 'angular-knob',
			location: appConfig['bowerRootPath'] + '/angular-knob',
			main: 'src/angular-knob'
		}, {
			name: 'angular-toastr',
			location: appConfig['bowerRootPath'] + '/angular-toastr',
			main: 'dist/angular-toastr.tpls.min'
		}, {
			name: 'ZeroClipboard',
			location: appConfig['bowerRootPath'] + '/zeroclipboard',
			main: 'dist/ZeroClipboard.min'
		}, {
			name: 'ng-clip',
			location: appConfig['bowerRootPath'] + '/ng-clip',
			main: 'dest/ng-clip.min'
		}, {
			name: 'ui-autocomplete',
			location: appConfig['bowerRootPath'] + '/ui-autocomplete',
			main: 'autocomplete'
		},

		/* TODO old/unused/deprecated?
		 {
		 name: 'jsurl',
		 location: appConfig['bowerRootPath'] + '/jsurl',
		 main: 'url'
		 }, {
		 name: 'bootstrap3-typeahead',
		 location: appConfig['bowerRootPath'] + '/bootstrap3-typeahead',
		 main: 'bootstrap3-typeahead'
		 }, {
		 name: 'prettify',
		 location: appConfig['bowerRootPath'] + '/google-code-prettify',
		 main: 'src/prettify'
		 }
		 */
	],
	paths: {
		'jquery': appConfig['bowerRootPath'] + '/jquery/dist/jquery',
		'jquery-ui': appConfig['bowerRootPath'] + '/jquery-ui/jquery-ui',
		'angular': appConfig['bowerRootPath'] + '/angular/angular',
		'angular-route': appConfig['bowerRootPath'] + '/angular-route/angular-route'
	},
	shim: {
		'app': {
			deps: ['angular', 'angular-route', 'jquery', 'jquery-ui', 'bootstrap']
		},
		'angular-route': {
			deps: ['angular']
		},
		'bootstrap': {
			deps: ['jquery', 'jquery-ui']
		},
		'jquery-ui': {
			exports: '$',
			deps: ['jquery']
		},
		'infinite-scroll': {
			deps: ['angular']
		},
		'angular-bootstrap': {
			deps: ['angular']
		},
		'angular-growl': {
			deps: ['angular']
		},
		'raty': {
			deps: ['jquery']
		},
		'riots': {
			deps: ['jquery']
		}
	}
};
