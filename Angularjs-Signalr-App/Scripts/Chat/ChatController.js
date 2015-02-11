
globalmodule.controller('mainCtrl', function ($scope, ChatService) {
    var hubproxy = ChatService;
    ChatService.connOpen;
    $scope.messages = [];
    $scope.showLogin = true;

    $scope.ChatStart = function () {
        $scope.User.SignalRId = ChatService.conn_Id();
        if ($scope.User.Name.length > 3) {
            $scope.showLogin = false;
            $scope.showChat = true;
        }
    }

    $scope.sendMessage = function () {
        if ($scope.User.Message.length > 0) {
            sendmsg();
        }
    }

    $scope.EnterSend = function (keykode) {
        if (keykode=="13" && $scope.User.Message.length > 0) {
            sendmsg();
        }
    }


    function sendmsg()
    {
        hubproxy.setData($scope.User);
        $scope.User.Message = "";
    }


    hubproxy.gethub.newData = function (User) {
        $scope.messages.push({ Name: User.Name, Message: User.Message });
        $scope.$apply();
    }
});