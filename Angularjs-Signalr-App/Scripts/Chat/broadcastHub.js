globalModule.factory('broadcastHub', function ($rootScope, $timeout, Hub, connectedHubs, broadcastingService, communicationHub) {
    var timer;
    var BroadcastHub = this;
    var hub = new Hub('broadcastHub', {
        rootPath: 'http://localhost:1581',
        listeners: {
            'updateLinks': function () {
                httpService.get("/cache/recacheuser");
                broadcastingService.broadcast("refreshLeftMenu");
            },
            'connectClientsToCommunicationHub': function () {
                if (communicationHub.getStatus() != 1 && communicationHub.getStatus() != 2) {
                    communicationHub.connect().done(function () {
                    });
                }
            },
            'disconnectClientsToCommunicationHub': function () {
                communicationHub.disconnect();
            }
        },
        methods: ['checkOperatorStatus'],
        errorHandler: function (error) {
            console.error(error);
        },
        autoConnect: true
    });
    hub.startingEvent = function () {

    };
    hub.reconnectingEvent = function () {

    };

    hub.disconnectedEvent = function () {
        timer = $timeout(function () {
            hub.connect();
        }, 1000, false);
    };
    hub.stateChangedEvent = function (state) {
        if (state.newState == 1) {
            if (timer) {
                $timeout.cancel(timer);
            }
        }
    };
    hub.connectionSlowEvent = function () {

    };
    BroadcastHub.isOnline = false;
    BroadcastHub.hub = hub;
    BroadcastHub.connect = function () {
        return hub.connect();
    }
    BroadcastHub.disconnect = function () {
        hub.disconnect();
    }
    BroadcastHub.checkOperatorStatus = function () {
        hub.checkOperatorStatus().done(function (status) {
            if (status) {
                communicationHub.connect().done(function () {
                })
            }
        })
    }
    return BroadcastHub;



});