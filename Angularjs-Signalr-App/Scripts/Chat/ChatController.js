
globalModule.controller('mainCtrl', function ($scope, $compile, $timeout,$http, broadcastingService, communicationHub, broadcastHub, $cookieStore) {
    var hubproxy = communicationHub.hub;
    $scope.skillId = 86;
    $scope.messages = communicationHub.GetMessages;
    $scope.communication = communicationHub;
    var myUniqIdentity = $cookieStore.get('myUniqIdentity');
    if (myUniqIdentity == null) {
        $scope.showLogin = true;
        $scope.showChat = false;
    }
    else {
        $scope.showLogin = false;
        $scope.showChat = false;
        communicationHub.hub.connection.qs = { "client": true, "uniqueIdentifier": myUniqIdentity };
        $http.get("http://localhost:1581/api/Guest/Get/" + myUniqIdentity).success(function (data, status, header, config) {
            if (data.IsSuccess) {
                $scope.User = data.Result;
                communicationHub.connect();
            }
        });
       
        //hubproxy.reconnecting();
    }

    var positions;
    if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(function (ps) { positions = ps; }); }



    $scope.ChatStart = function () {
        //$scope.User.InboundUrl = window.location.href;
        //$scope.User.UserAgent = navigator.userAgent;
        //$scope.User.Latitude = positions.coords.latitude.toString();
        //$scope.User.Longitude = positions.coords.longitude.toString();
        //$.post("http://localhost:1581/api/Guest/", { guest: $scope.User }, function (data) { localStorage.setItem('myUniqIdentity', data); $scope.User.UserUniqueIdentifier = data; })
        var data = {
            NameSurname: $scope.User.NameSurname,
            Email: $scope.User.Email,
            PhoneNumber: $scope.User.PhoneNumber,
            SkillId: $scope.skillId
        };
        $http({
            method: 'POST',
            url: "http://localhost:1581/api/Guest/createorget",
            data: JSON.stringify(data),
            cache: false
        }).success(function (data, status, header, config) {
            if (data.IsSuccess) {
                $cookieStore.put('myUniqIdentity', data.Result);
                myUniqIdentity = data.Result;
                $scope.User.UserUniqueIdentifier = data.Result;
                if (myUniqIdentity != null) {
                    communicationHub.hub.connection.qs = { "client": true, "uniqueIdentifier": myUniqIdentity };
                    hubproxy.connect();
                    $scope.showLogin = false;
                    $scope.showChat = true;
                }
            }
        });
        //$.post("http://localhost:1581/Guests/Create", {
        //    NameSurname: $scope.User.NameSurname,
        //    Email: $scope.User.Email,
        //    PhoneNumber: $scope.User.PhoneNumber,
        //    SkillId : $scope.skillId
        //}, function (data) {
           
        //})
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