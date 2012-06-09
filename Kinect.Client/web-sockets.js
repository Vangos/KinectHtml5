window.onload = function () {
    var status = document.getElementById("status");
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    if (!window.WebSocket) {
        status.innerHTML = "Your browser does not support web sockets!";
        return;
    }

    status.innerHTML = "Connecting to server...";

    // Initialize a new web socket.
    var socket = new WebSocket("ws://localhost:8181/KinectHtml5");

    // Connection established.
    socket.onopen = function () {
        status.innerHTML = "Connection successful.";
    };

    // Connection closed.
    socket.onclose = function () {
        status.innerHTML = "Connection closed.";
    }

    // Receive data FROM the server!
    socket.onmessage = function (evt) {
        status.innerHTML = "Kinect data received.";

        // Get the data in JSON format.
        var jsonObject = eval('(' + evt.data + ')');

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#FF0000";
        context.beginPath();

        // Display the skeleton joints.
        for (var i = 0; i < jsonObject.skeletons.length; i++) {
            for (var j = 0; j < jsonObject.skeletons[i].joints.length; j++) {
                var joint = jsonObject.skeletons[i].joints[j];

                // Draw!!!
                context.arc(parseFloat(joint.x), parseFloat(joint.y), 10, 0, Math.PI * 2, true);
            }
        }

        context.closePath();
        context.fill();

        // Inform the server about the update.
        socket.send("Skeleton updated on: " + (new Date()).toDateString() + ", " + (new Date()).toTimeString());
    };
};