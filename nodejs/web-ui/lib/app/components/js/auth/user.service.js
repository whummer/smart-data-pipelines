'use strict';

angular.module('rioxApp')
  .factory('User', function ($resource) {
	var url = appConfig.services.users.url + '/:id/:controller';
    return $resource(url, {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  });
