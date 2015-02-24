globalModule.factory('broadcastingService', function ($rootScope) {
    return {
        broadcast: function (event, evData) {
            $rootScope.$broadcast(event, { data: evData });
        },
        refresh: function (event, eventData) {
            $rootScope.$broadcast(event, { data: eventData });
        },
    }
});