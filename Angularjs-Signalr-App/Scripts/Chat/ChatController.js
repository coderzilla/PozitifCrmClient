
globalModule.controller('mainCtrl', function ($scope, $compile, $timeout, broadcastingService, communicationHub, broadcastHub, $cookieStore) {
    var hubproxy = communicationHub.hub; 
    $scope.messages = communicationHub.GetMessages;
    if (localStorage.getItem('myUniqIdentity') == null) {
        $scope.showLogin = true;
        $scope.showChat = false;
    }
    else {
        $scope.showLogin = false;
        $scope.showChat = true;
        communicationHub.hub.connection.qs = { "client": true, "uniqueIdentifier": localStorage.getItem("myUniqIdentity") };
        $.get("http://localhost:1581/Guests/Get", { guest: $cookieStore.get('myUniqIdentity') }, function (data) { $scope.User = data; })
        
        hubproxy.connect();
    }

    var positions;
    if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(function (ps) { positions = ps; }); }



    $scope.ChatStart = function () {
        //$scope.User.InboundUrl = window.location.href;
        //$scope.User.UserAgent = navigator.userAgent;
        //$scope.User.Latitude = positions.coords.latitude.toString();
        //$scope.User.Longitude = positions.coords.longitude.toString();
        //$.post("http://localhost:1581/Guests/Create", { guest: $scope.User }, function (data) { localStorage.setItem('myUniqIdentity', data); $scope.User.UserUniqueIdentifier = data; })
        $.post("http://localhost:1581/Guests/Create", {
            NameSurname: $scope.User.NameSurname,
            Email: $scope.User.Email,
            PhoneNumber: $scope.User.PhoneNumber,
            InboundUrl: window.location.href,
            UserAgent: navigator.userAgent,
            Latitude: positions.coords.latitude.toString(),
            Longitude: positions.coords.longitude.toString()
        }, function (data) {
            $cookieStore.put('myUniqIdentity', data); 
            //localStorage.setItem('myUniqIdentity', data); 
            $scope.User.UserUniqueIdentifier = data;
            if (localStorage.getItem('myUniqIdentity') != null) {
                communicationHub.hub.connection.qs = { "client": true, "uniqueIdentifier": localStorage.getItem("myUniqIdentity") };
               
                hubproxy.connect();
                $scope.showLogin = false;
                $scope.showChat = true;
            }
        })
    }

    $scope.sendMessage = function () {
        if ($scope.User.Message.length > 0) {
            sendmsg();
        }
    }

    $scope.EnterSend = function (keykode) {
        if (keykode == "13" && $scope.User.Message.length > 0) {
            sendmsg();
        }
    }


    function sendmsg() {
        communicationHub.hub.sendMessage($scope.User); 
        $scope.User.Message = "";
    } 
});