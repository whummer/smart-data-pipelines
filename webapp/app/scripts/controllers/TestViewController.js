define(['app'], function(app)
{
    app.controller('TestViewController',
    [
        '$scope',

        function($scope)
        {
            $scope.page =
            {
                heading: 'Testing and Simulation'
            };
        }
    ]);
});