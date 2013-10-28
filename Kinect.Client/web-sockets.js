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
    socket.binaryType = "blob";

    // Connection established.
    socket.onopen = function () {
        status.innerHTML = "Connection successful.";
    };

    // Connection closed.
    socket.onclose = function () {
        status.innerHTML = "Connection closed.";
    }

    // Receive data FROM the server!
    socket.onmessage = function (event) {
        if (typeof event.data === "string") {
            status.innerHTML = "Kinect skeletal data received.";

            // 1. Get the data in JSON format.
            var jsonObject = eval('(' + event.data + ')');

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "#FF0000";
            context.beginPath();

            // 2. Display the skeleton joints.
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
        }
        else if (event.data instanceof Blob) {
            status.innerHTML = "Kinect image data received.";

            // 1. Get the data in binary format.
            var blob = event.data;

            // 2. Create a new temp URL for the binary object.
            window.URL = window.URL || window.webkitURL;
            var source = window.URL.createObjectURL(blob);

            // Create an image tag programmatically.
            var image = document.getElementById("image");
            image.src = source;
        }
    };
};