/**
 * global app configurations
 */
var appConfig = {
	appRootPath: "/app",
	services: {
		core: { url: "http://localhost:8080/api/v1" },
		thingTypes: { url: "http://localhost:8080/api/v1/catalog/thing-types" },
		manufacturers: { url: "http://localhost:8080/api/v1/catalog/manufacturers" },
		thingTypeProps: { url: "http://localhost:8080/api/v1/thing-types/properties" },
		drivers: { url: "http://localhost:8080/api/v1/drivers" },
		things: { url: "http://localhost:8080/api/v1/things" },
		categories: { url: "http://localhost:8080/api/v1/categories" },
		semanticTypes: { url: "http://localhost:8080/api/v1/semantic-types" },
		simulations: { url: "http://localhost:8080/api/v1/simulations" },
		ratings: { url: "http://localhost:8080/api/v1/ratings" },
		simulationProps: { url: "http://localhost:8080/api/v1/simulations/properties" },
		simulationDevices: { url: "http://localhost:8080/api/v1/simulations/devices" },
		stats: { url: "http://localhost:8080/api/v1/stats" },
		users: { url: "http://localhost:8080/api/v1/users" },
		websocket: { url: "ws://localhost:8085/websocket" }
	},
	auth: {
		github: {
			client_id: "49dfffa20fdaf8c5529d"
		},
		google: {
			client_id: "1034816257353-9on087jmdlgqsh3rce5gdu1f2oouvgo0.apps.googleusercontent.com"
		},
		facebook: {
			client_id: "543561462440557"
		},
		redirect_uri: "http://localhost:8080/app/views/login_result.html"
	}
};

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
