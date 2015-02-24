var _connectedHubs = [];

var hubModule = (function ($) {

    var url = 'http://localhost:1581/signalr';
    var _connection;
    var _proxy;
    var _instance;
    var _events = {};

    var _init = function (hubName) {
        var serverCallbackCount = 0;
        _connection = $.hubConnection('http://localhost:1581');
        _proxy = _connection.createHubProxy(hubName);

        _connection.starting(function () {
            //Global invocation;
            console.log("connection starting");

            if (_events.onConnectionStarting) {
                _events.onConnectionStarting();
            }
        });
        _connection.received(function (e) {
            console.log("received");
        });
        _connection.disconnected(function () {
            //Global invocation
            console.log("disconnected");

            if (_events.onDisconnected) {
                _events.onDisconnected();
            }
        });
        _connection.reconnecting(function () {
            //Global invocation
            console.log("reconnecting");

            if (_events.onReconnecting) {
                _events.onReconnecting();
            }
        });
        _connection.reconnected(function () {
            //Global invocation
            console.log("reconnected");

            if (_events.onReconnected) {
                _events.onReconnected();
            }
        });
        _connection.connectionSlow(function () {
            //Global invocation
            console.log("connection Slow");

            if (_events.onConnectionSlow) {
                _events.onConnectionSlow();
            }
        });
        _connection.stateChanged(function (state) {
            if (_events.onStateChanged) {
                _events.onStateChanged();
            }
        });

        return {
            proxy: _proxy,

            defineServerCallback: function (name, callback) {
                _proxy.on(name, callback);
                serverCallbackCount++;
            },
            establishConnection: function (qsDict, success, fail) {
                if (serverCallbackCount == 0) {
                    return false;
                }
                if (qsDict && qsDict.length > 0) {
                    for (var i = 0; i < qsDict.length; i++) {
                        _connection.qs = qsDict[i];
                    }
                }
                var conn = _connection.start().done(success).fail(fail);
            },
            addConnectionEstablishMethods: function (methods) {
                for (var name in methods) {
                    _events[name] = methods[name];
                }
            },
        };
    };
    return {
        instance: function (hubName) {
            var results = $.grep(_connectedHubs, function (e) { return e.name == hubName });
            if (results.length == 0) {
                //if (!_instance) {
                _instance = _init(hubName);
                _connectedHubs.push({ name: hubName, hubInstance: _instance });
            }
            else {
                _instance = results[0].hubInstance;
            }
            return _instance;
        }
    }
})(jQuery);