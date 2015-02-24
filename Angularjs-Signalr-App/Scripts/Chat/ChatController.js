
globalmodule.controller('mainCtrl', function ($scope, ChatService) {
    var hubproxy = ChatService;
   
    $scope.messages = []; 
    if (localStorage.getItem('myUniqIdentity') == null) {
        $scope.showLogin = true;
        $scope.showChat = false;
    }
    else { 
        $scope.showLogin = false;
        $scope.showChat = true;
        $.get("http://localhost:1581/Guests/Get", { guest: localStorage.getItem('myUniqIdentity') }, function (data) {   $scope.User = data;  })
    }

    var positions;
    if (navigator.geolocation) {  navigator.geolocation.getCurrentPosition(function (ps) { positions = ps;   });  }
 


    $scope.ChatStart = function () { 
        //$scope.User.InboundUrl = window.location.href;
        //$scope.User.UserAgent = navigator.userAgent;
        //$scope.User.Latitude = positions.coords.latitude.toString();
        //$scope.User.Longitude = positions.coords.longitude.toString();
        //$.post("http://localhost:1581/Guests/Create", { guest: $scope.User }, function (data) { localStorage.setItem('myUniqIdentity', data); $scope.User.UserUniqueIdentifier = data; })

         
        $.post("http://localhost:1581/Guests/Create", { NameSurname: $scope.User.NameSurname, Email: $scope.User.Email, PhoneNumber: $scope.User.PhoneNumber, InboundUrl: window.location.href, UserAgent: navigator.userAgent, Latitude: positions.coords.latitude.toString(), Longitude: positions.coords.longitude.toString() },
            function (data) {
                localStorage.setItem('myUniqIdentity', data);
                $scope.User.UserUniqueIdentifier = data;
            })

        $scope.showLogin = false;
        $scope.showChat = true;
      
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
        hubproxy.setData($scope.User);
        $scope.User.Message = "";
    }


    hubproxy.gethub.newData = function (User) {
        $scope.messages.push({ NameSurname: User.NameSurname, Message: User.Message });
        $scope.$apply();
    }
});