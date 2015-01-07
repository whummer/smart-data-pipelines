
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
            name: 'raty',
            location: appConfig['bowerRootPath'] + '/raty',
            main: 'lib/jquery.raty'
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
            name: 'angular-ui-grid',
            location: appConfig['bowerRootPath'] + '/angular-ui-grid',
            main: 'ui-grid'
        }, {
            name: 'bootstrap-tagsinput',
            location: appConfig['bowerRootPath'] + '/bootstrap-tagsinput',
            main: 'dist/bootstrap-tagsinput'
        }, {
            name: 'typeahead',
            location: appConfig['bowerRootPath'] + '/typeahead.js',
            main: 'dist/typeahead.bundle'
        }, {
        	name: 'infinite-scroll',
        	location: appConfig['bowerRootPath'] + '/ngInfiniteScroll',
        	main: 'build/ng-infinite-scroll.min.js'
        }, {
        	name: 'angular-hotkeys',
        	location: appConfig['bowerRootPath'] + '/angular-hotkeys',
        	main: 'build/hotkeys.min.js'
        }, {
        	name: 'angular-keyboard',
        	location: appConfig['bowerRootPath'] + '/angular-keyboard',
        	main: 'keyboard.min.js'
        }, {
            name: 'chartjs',
            location: appConfig['bowerRootPath'] + '/chartjs/',
        	main: 'Chart.min'
        }

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
        'raty': {
            deps: ['jquery']
        }
    }
};
