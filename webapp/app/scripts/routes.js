define([], function()
{
    return {
        defaultRoutePath: '/',
        routes: {
            '/': {
                templateUrl: '/views/home.html',
                dependencies: [
                    'controllers/AppController',
                    'controllers/HomeViewController'
                ]
            },
            '/world': {
                templateUrl: '/views/world.html',
                dependencies: [
                    'controllers/AppController',
                    'controllers/WorldViewController'
                ]
            },
            '/contact': {
                templateUrl: '/views/contact.html',
                dependencies: [
                    'controllers/AppController',
                    'controllers/ContactViewController'
                ]
            },
            '/login': {
                templateUrl: '/views/login.html',
                dependencies: [
                    'controllers/AppController',
                    'controllers/LoginViewController'
                ]
            },
            '/easyui': {}
        }
    };
});