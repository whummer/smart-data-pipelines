define([], function()
{
    return {
        defaultRoutePath: '/',
        routes: {
            '/': {
                templateUrl: '/views/home.html',
                dependencies: [
                    'controllers/HomeViewController'
                ]
            },
            '/world': {
                templateUrl: '/views/world.html',
                dependencies: [
                    'controllers/WorldViewController'
                ]
            },
            '/contact': {
                templateUrl: '/views/contact.html',
                dependencies: [
                    'controllers/ContactViewController'
                ]
            },
            '/login': {
                templateUrl: '/views/login.html',
                dependencies: [
                    'controllers/LoginViewController'
                ]
            },
            '/easyui': {}
        }
    };
});