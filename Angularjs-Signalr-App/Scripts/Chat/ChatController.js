
globalmodule.controller('mainCtrl', function ($scope, ChatService) {
   
    var hubproxy = ChatService;
    ChatService.connOpen;
    $scope.messages = [];
    $scope.showLogin = true; 
    var positions;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showlocation);
    }
    var ip = "";
    $.get('http://jsonip.com', function (res) {ip = res.ip; });
    function showlocation(ps) { 
        positions = ps;
    }
    $scope.ChatStart = function () {
        //$scope.User.SignalRId = ChatService.conn_Id();
     

       
        $scope.User.IpAddress = ip;
        $scope.User.UserUniqueIdentifier = null;
        
        $scope.User.InboundUrl = window.location.href;
        var now = new Date();
        $scope.User.LastConnectionDate = now.toLocaleString();
        $scope.User.SkillId = null;
        $scope.User.UserAgent = null; 
        $scope.User.Latitude = positions.coords.latitude.toString();
        $scope.User.Longitude = positions.coords.longitude.toString(); 
        $.post("http://localhost:1581/Guests/Create", { guest: $scope.User }, function (data) {
             
              
        })
          //.done(function () {
          //    $scope.showLogin = false;
          //    $scope.showChat = true;
          //})
          //.fail(function () {
          //    console.log("error");
          //})
          //.always(function () {
          //    console.log("finished");
        //});

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
        $scope.messages.push({ Name: User.Name, Message: User.Message });
        $scope.$apply();
    }
});