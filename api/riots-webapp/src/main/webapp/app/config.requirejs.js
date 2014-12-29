
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
            name: 'leaflet',
            location: '/bower_components/leaflet/',
            main: 'dist/leaflet-src'
        }, {
            name: 'chartjs',
            location: '/bower_components/chartjs/'
        }, {
            name: 'bootstrap',
            location: '/bower_components/bootstrap',
            main: 'dist/js/bootstrap.min'
        }, {
            name: 'raty',
            location: '/bower_components/raty',
            main: 'lib/jquery.raty'
        }, {
            name: 'hello',
            location: '/bower_components/hello',
            main: 'dist/hello.all'
        }, {
            name: 'prettify',
            location: '/bower_components/google-code-prettify',
            main: 'src/prettify'
        }, {
            name: 'sockjs',
            location: '/bower_components/sockjs',
            main: 'sockjs'
        }, {
            name: 'stomp-websocket',
            location: '/bower_components/stomp-websocket',
            main: 'lib/stomp'
        }, {
            name: 'angular-bootstrap',
            location: '/bower_components/angular-bootstrap',
            main: 'ui-bootstrap-tpls'
        }, {
            name: 'angular-ui-grid',
            location: '/bower_components/angular-ui-grid',
            main: 'ui-grid'
        }, {
            name: 'bootstrap-tagsinput',
            location: '/bower_components/bootstrap-tagsinput',
            main: 'dist/bootstrap-tagsinput'
        },{
            name: 'jsurl',
            location: '/bower_components/jsurl',
            main: 'url'
        },{
            name: 'typeahead',
            location: '/bower_components/typeahead.js',
            main: 'dist/typeahead.bundle'
        },{
            name: 'bootstrap3-typeahead',
            location: '/bower_components/bootstrap3-typeahead',
            main: 'bootstrap3-typeahead'
        }, {
            name: 'auth',
            location: '/app/scripts/modules',
            main: 'auth.js'
        }
    ],
    paths: {
        'app': appConfig['appRootPath'] + '/scripts/app',
        'routes': appConfig['appRootPath'] + '/scripts/routes',
        'angular': '/bower_components/angular/angular',
        'bootstrap': '/bower_components/bootstrap/js',
        'angular-route': '/bower_components/angular-route/angular-route',
        'jquery': '/bower_components/jquery/dist/jquery',
        'jquery-ui': '/bower_components/jquery-ui/jquery-ui'
    },
    shim: {
        'app': {
            deps: ['angular', 'angular-route', 'jquery', 'bootstrap']
        },
        'angular-route': {
            deps: ['angular']
        },
        'bootstrap': {
            deps: ['jquery', 'jquery-ui']
        }
    }
};
