'use strict';
globalmodule.service('ChatService', function ($, $rootScope) {
    $.connection.hub.url = "http://localhost:1581/signalr";
    var hubproxy = $.connection.communicationHub;
    var _conn = $.connection.hub;
    var _connopen = false;
    $.connection.hub.qs = { "client": true, "uniqueIdentifier" : localStorage.getItem("myUniqIdentity")  };   
    function _connectionOpen() {
        if ($.connection.hub.id != undefined) {
            $.connection.hub.stateChanged(function (change) {
                if (change.newState === $.signalR.connectionState.reconnecting) {
                    console.log('Yeniden Bağlandınız')
                }
                else if (change.newState === $.signalR.connectionState.connected) {
                    console.log('Bağlısınız');
                }
                else if (_conn.state == $.signalR.connectionState.disconnected) {
                    if (_connopen) {
                        $.connection.hub.reconnecting(function () {
                            OnReconnected();
                        });
                    }
                    else {
                       
                        _conn.logging = true;
                        _conn.start()
                        .done(function (change) {
                            console.log('Yeni Bağlantı')
                        }).fail(function (error) {
                            console.log(error);
                        });
                        _connopen = true;
                    }
                }
            });
        }
        else {
            _conn.logging = true;
            _conn.start()
            .done(function (change) {
                console.log('Yeni Bağlantı')
            }).fail(function (error) {
                console.log(error);
            });
            _connopen = true;
        }
        return true;
    }

    function connId_Get() {
        return $.connection.hub.id;
    }

    return {
        connOpen: _connectionOpen(),
        setData: function (data) {
            if (_connectionOpen())
            { hubproxy.server.sendMessage(data); }
            return "";
        }, 
        gethub: hubproxy.client,
        conn_Id: connId_Get
    };
});

