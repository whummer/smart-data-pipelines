/**
 * global app configurations
 */
var appConfig = {

	appRootPath: "/app",
	services: {
		core: { url: "http://localhost:8080/api/v1" },
		deviceTypes: { url: "http://localhost:8080/api/v1/device-types" },
		deviceTypeProps: { url: "http://localhost:8080/api/v1/device-types/properties" },
		deviceDrivers: { url: "http://localhost:8080/api/v1/drivers" },
		devices: { url: "http://localhost:8080/api/v1/devices" },
		categories: { url: "http://localhost:8080/api/v1/categories" },
		semanticTypes: { url: "http://localhost:8080/api/v1/semantic-types" },
		simulations: { url: "http://localhost:8080/api/v1/simulations" },
		ratings: { url: "http://localhost:8080/api/v1/ratings" },
		simulationProps: { url: "http://localhost:8080/api/v1/simulations/properties" },
		simulationDevices: { url: "http://localhost:8080/api/v1/simulations/devices" },
		websocket: { url: "ws://localhost:8082/" }
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
		}
	}
}

/**
 * global configurations for requirejs
 */
var requirejsAppConfig = {
    baseUrl: '.',
    name: 'scripts/init.js',
    out: '/app/scripts/riots-all.js',
    waitSeconds: 5,
    packages: [
        {
            name: 'riot',
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
        }, {
            name: 'auth',
            location: '/app/scripts/modules',
            main: 'auth.js'
        }
    ],
    paths: {
		'routes': appConfig['appRootPath'] + '/scripts/routes',
		'angular-route': '/bower_components/angular-route/angular-route',
		'jquery': '/bower_components/jquery/dist/jquery',
		'jquery-ui': '/bower_components/jquery-ui/jquery-ui',
		'put-selector': '/bower_components/put-selector',
		'xstyle': '/bower_components/xstyle'
    },
	shim: {
		'app': {
			deps: ['angular', 'angular-route', 'bootstrap']
		},
		'angular-route': {
			deps: ['angular']
		},
		'bootstrap': {
			deps: ['jquery', 'jquery-ui']
		}
	}
};
