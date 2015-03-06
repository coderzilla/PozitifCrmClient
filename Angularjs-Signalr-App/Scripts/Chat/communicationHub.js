var COMMUNICATIONSTATUS = {
    NONE: {},
    SERVICEUNAVAILABLE: { statusColor: "black", statusMessage: "Service Unavailable" },
    CONNECTING: { statusColor: "#fea223", statusMessage: "Connecting" },
    CONNECTED: { statusColor: "#95b75d", statusMessage: "Online" },
    RECONNECTING: { statusColor: "rgba(0, 132, 132, 0.81)", statusMessage: "Reconnecting" },
    CONNECTIONSLOW: { statusColor: "rgba(0, 132, 132, 0.81)", statusMessage: "Connection Slow" },
    DISCONNECTED: { statusColor: "rgb(251, 70, 11)", statusMessage: "Offline" }
}

globalModule.factory('communicationHub', function ($rootScope, Hub, connectedHubs, $timeout, broadcastingService) {
    var CommunicationHub = this;
    CommunicationHub.Messages=[];
    var hub = new Hub('communicationHub', {
        rootPath: 'http://localhost:1581',
        listeners: {
            'newConnection': function (id) {

            },
            'removeConnection': function (id) {
                Employees.connected.splice(Employees.connected.indexOf(id), 1);
                $rootScope.$apply();
            },
            'lockEmployee': function (id) {
                var employee = find(id);
                employee.Locked = true;
                $rootScope.$apply();
            },
            'unlockEmployee': function (id) {
                var employee = find(id);
                employee.Locked = false;
                $rootScope.$apply();
            },
            'updatedEmployee': function (id, key, value) {
                var employee = find(id);
                employee[key] = value;
                $rootScope.$apply();
            },
            'addEmployee': function (employee) {
                Employees.all.push(new Employee(employee));
                $rootScope.$apply();
            },
            'removeEmployee': function (id) {
                var employee = find(id);
                Employees.all.splice(Employees.all.indexOf(employee), 1);
                $rootScope.$apply();
            },
            'newData': function (data) {
                alert("asd")
            },
            'newChat': function (data) {
                $timeout(function () {
                    hub.accessible(data).done(function (data) {
                        console.log(data);

                        if (data.IsSuccess && data.Result) {
                            CommunicationHub.showChat = true;
                            $rootScope.$apply();
                        }
                    });
                },500);
            },
            'newMessage': function (data) {
                CommunicationHub.Messages.push(data);
                $rootScope.$apply();
            },
            'showSurvey' : function(data){
                $timeout(function () {
                    CommunicationHub.survey = data;
                    CommunicationHub.showSurvey = true;
                    $rootScope.$apply();
                });
            },
            'startChat': function (data) {
                CommunicationHub.showChat = true;
                $rootScope.$apply();
            }
        },
        methods: ['lock', 'unlock', 'newData', 'SendGuestMessage', 'accessible'],
        errorHandler: function (error) {
            console.error(error);
        }
    });
    hub.startingEvent = function () {
        $timeout(function () {
            CommunicationHub.currentStatus = COMMUNICATIONSTATUS.CONNECTING;
        });
    };
    hub.reconnectingEvent = function () {
        $timeout(function () {
            CommunicationHub.currentStatus = COMMUNICATIONSTATUS.RECONNECTING;
        })
    };

    hub.disconnectedEvent = function () {
        $timeout(function () {
            CommunicationHub.currentStatus = COMMUNICATIONSTATUS.DISCONNECTED;
            $rootScope.$apply();
        })
    };
    hub.stateChangedEvent = function (state) {
        broadcastingService.broadcast('connectionStateChanged', state);
        if (state.newState == 1) {
            $timeout(function () {
                CommunicationHub.currentStatus = COMMUNICATIONSTATUS.CONNECTED;
            });
        }
    };
    hub.connectionSlowEvent = function () {
        $timeout(function () {
            CommunicationHub.currentStatus = COMMUNICATIONSTATUS.CONNECTIONSLOW;
        });
    };
    //$(window).on('unload', function () {
    //    hub.disconnect();
    //});
    $(window).on('beforeunload', function () {
        hub.disconnect();
        return;
    });
    var onlineColor = "#95b75d";
    var offlineColor = "rgb(251, 70, 11)";
    CommunicationHub.currentStatus = COMMUNICATIONSTATUS.NONE;
    CommunicationHub.isOnline = false;
    CommunicationHub.hub = hub;
    CommunicationHub.statusColor = offlineColor;
    CommunicationHub.connect = function () {
        return hub.connect();
    }
    CommunicationHub.showChat = false;
    CommunicationHub.disconnect = function () {
        //hub.connection.qs = { "closed": true };
        //$timeout(function () {
        hub.disconnect();
        //}, 500);
    }

 

    CommunicationHub.getStatus = function () {
        return hub.connection.state;
    }
    return CommunicationHub;
});