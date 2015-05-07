
globalModule.controller('mainCtrl', function ($scope, $compile, $timeout, $http, broadcastingService, communicationHub, broadcastHub, $cookieStore) {
    $scope.$on('chatSessionIdUpdated', function (data) {
        console.log(data);
    });
    var hubproxy = communicationHub.hub;
    $scope.isWriting = false
    var lastWatchResult = false;
    $scope.$watch('isWriting', function (args) {
        if (lastWatchResult != args) {
            lastWatchResult = args;
            communicationHub.hub.clientWritingStatusChanged(communicationHub.chatSessionId, args);
        }
    })
    $scope.skillId = 86;
    $scope.messages = communicationHub.Messages;
    $scope.communication = communicationHub;
    $scope.IsOperatorConn = false;
    $scope.communication.showChat = false;
    var myUniqIdentity = $cookieStore.get('myUniqIdentity');
    if (myUniqIdentity == null) {
        $scope.showLogin = true;
        $scope.showChat = false;
    }
    else {
        $scope.showLogin = false;
        $scope.showChat = false;
        communicationHub.hub.connection.qs = { "client": true, "uniqueIdentifier": myUniqIdentity };
        $http.get("http://localhost:1581/api/guest/get/" + myUniqIdentity).success(function (data, status, header, config) {
            if (data.IsSuccess) {
                $scope.User = data.Result;
                communicationHub.connect();
                $scope.showChat = true;
            }
            else {
                $scope.showLogin = true;
                $scope.showChat = false;
            }
        });

        //hubproxy.reconnecting();

    }

    var positions;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (ps) {
            communicationHub.geoPosition = ps;
        });
    }



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
                $scope.User.UserUniqueIdentifier = $cookieStore.get('myUniqIdentity');
                if (myUniqIdentity != null) {
                    communicationHub.hub.connection.qs = { "client": true, "uniqueIdentifier": myUniqIdentity };
                    hubproxy.connect();
                    $scope.showLogin = false;
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
    $scope.stopSession = function () {
        $http.get("http://localhost:1581/api/chat/stopChatFromGuest/" + communicationHub.chatSessionId + "/" + $cookieStore.get('myUniqIdentity')).success(function (data, status, header, config) {
            if (data.IsSuccess) {
                if (data.Result) {
                    communicationHub.survey = data.Result;
                }
                else {
                    communicationHub.disconnect();
                }
            }
        });
    }
    $scope.sendSurvey = function (form) {
        if (form.$valid) {
            var x = _.map(communicationHub.survey.SurveyQuestions, function (question) {
                if (question.SelectedAnswer) {
                    return question.SelectedAnswer;
                }
            });
            $http({
                method: 'POST',
                url: "http://localhost:1581/api/guest/postSurvey/" + $cookieStore.get('myUniqIdentity'),
                data: x,
                cache: false
            });
            $scope.communication.showSurvey = false;
            $scope.showChat = true;
        }
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
        var newMessage = {
            Message: $scope.User.Message,
            MessageDate: new Date(),
            ChatSessionId: communicationHub.chatSessionId,
            MessageStatus: 1,
            MessageType: 1,
            shownMessageDate: new Date().getHours() + ":" + new Date().getMinutes(),
            IsGuest: true
        };
        communicationHub.hub.SendGuestMessage(newMessage);
        $scope.messages.push(newMessage);
        $scope.User.Message = "";
        communicationHub.setscrollbottom();
    }
    //$scope.focused = function () {
    //    if ($scope.User.Message.length > 0) {
    //        $scope.isWriting = true;
    //    }
    //}
    $scope.blured = function () {
       $scope.isWriting = false;
    }
    $scope.keyPressed = function (keyCode) {
        if (keyCode == "13" && $scope.User.Message.length > 0) {
            sendmsg();
        }
    }
    $scope.writing = function (keyCode) {
        if ($scope.User.Message.length > 0) {
            $scope.isWriting = true;
        }
        else {
            $scope.isWriting = false;
        }
    }


    communicationHub.setUser = function() {
        communicationHub.hub.connection.qs = { "client": true, "uniqueIdentifier": myUniqIdentity };
        $http.get("http://localhost:1581/api/guest/get/" + myUniqIdentity).success(function (data, status, header, config) {
            if (data.IsSuccess) {
                $scope.User = data.Result; 
            } 
        }); 
    }
   
    communicationHub.setscrollbottom = function() {
        $("#chatcontenti").animate({ scrollTop: $("#chatcontenti").get(0).scrollHeight }, 250)
    }
});