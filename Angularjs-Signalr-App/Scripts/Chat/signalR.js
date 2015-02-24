globalModule.factory('Hub', function ($, connectedHubs, $timeout, $cookies) {
    //var globalConnection = null;

    var initGlobalConnection = function (hubName, options) {
        var connection = _.filter(connectedHubs, function (e) { return e.name == hubName; })[0];
        if (!connection) {
            //$.signalR.ajaxDefaults.headers = { Authorization: "Bearer " + $cookies.accessToken};
            if (options && options.rootPath) {
                connection = { name: hubName, hubInstance: $.hubConnection(options.rootPath, { userDefaultPath: false }) };
            } else {
                connection = { name: hubName, hubInstance: $.hubConnection() };
            }
            connectedHubs.push(connection);
        }
        return connection.hubInstance;
    };
    return function (hubName, options) {
        var Hub = this;
        var connection = initGlobalConnection(hubName, options);
        Hub.connection = connection;
        Hub.proxy = Hub.connection.createHubProxy(hubName);

        Hub.connection.starting(function () {
            console.log(hubName + " connection establishing");
            if (Hub.startingEvent) {
                Hub.startingEvent();
            }
        });
        Hub.connection.disconnected(function (e) {
            console.log(hubName + " connection disconnected");
            if (Hub.disconnectedEvent) {
                Hub.disconnectedEvent();
            }
        });
        Hub.connection.reconnecting(function () {
            console.log(hubName + " connection reconnecting");
            if (Hub.reconnectingEvent) {
                Hub.reconnectingEvent();
            }
        });
        Hub.connection.reconnected(function () {
            console.log(hubName + " connection reconnected");
            if (Hub.reconnectedEvent) {
                Hub.reconnectedEvent();
            }
        });
        Hub.connection.connectionSlow(function () {
            console.log(hubName + " connection slow");
            if (Hub.connectionSlowEvent) {
                Hub.connectionSlowEvent();
            }
        });
        Hub.connection.stateChanged(function (state) {
            console.log(hubName + " connection state changed. New state : " + state.newState);
            if (Hub.stateChangedEvent) {
                Hub.stateChangedEvent(state);
            }
        });
        Hub.connection.received(function () {
            console.log(hubName + " packet received");
            if (Hub.receivedEvent) {
                Hub.receivedEvent();
            }
        });

        Hub.on = function (event, fn) {
            Hub.proxy.on(event, fn);
        };
        Hub.invoke = function (method, args) {
            return Hub.proxy.invoke.apply(Hub.proxy, arguments)
        };
        Hub.disconnect = function () {
            Hub.connection.stop();
        };
        Hub.connect = function () {
            return Hub.connection.start();
        };

        if (options && options.listeners) {
            angular.forEach(options.listeners, function (fn, event) {
                Hub.on(event, fn);
            });
        }
        if (options && options.methods) {
            angular.forEach(options.methods, function (method) {
                Hub[method] = function () {
                    var args = $.makeArray(arguments);
                    args.unshift(method);
                    return Hub.invoke.apply(Hub, args);
                };
            });
        }
        if (options && options.queryParams) {
            Hub.connection.qs = options.queryParams;
        }
        if (options && options.events) {
            angular.forEach(options.events, function (event) {
                console.log(event);
            })
        }
        if (options && options.errorHandler) {
            Hub.connection.error(options.errorHandler);
        }

        //Adding additional property of promise allows to access it in rest of the application.
        //Hub.promise = Hub.connection.start();
        return Hub;
    }
});