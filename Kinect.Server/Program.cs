using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fleck;
using Microsoft.Kinect;

namespace Kinect.Server
{
    class Program
    {
        static KinectSensor _sensor;
        static List<IWebSocketConnection> _sockets;

        static bool _initialized = false;
        static Skeleton[] _skeletons = new Skeleton[6];

        static void Main(string[] args)
        {
            if (KinectSensor.KinectSensors.Count <= 0) return;

            InitilizeKinect();
            InitializeSockets();
        }

        private static void InitializeSockets()
        {
            _sockets = new List<IWebSocketConnection>();

            var server = new WebSocketServer("ws://localhost:8181");

            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    Console.WriteLine("Connected to " + socket.ConnectionInfo.ClientIpAddress);
                    _sockets.Add(socket);
                };
                socket.OnClose = () =>
                {
                    Console.WriteLine("Disconnected from " + socket.ConnectionInfo.ClientIpAddress);
                    _sockets.Remove(socket);
                };
                socket.OnMessage = message =>
                {
                    Console.WriteLine(message);
                };
            });

            _initialized = true;

            Console.ReadLine();
        }

        private static void InitilizeKinect()
        {
            _sensor = KinectSensor.KinectSensors.SingleOrDefault();
            _sensor.SkeletonStream.Enable();
            _sensor.SkeletonFrameReady += new EventHandler<SkeletonFrameReadyEventArgs>(Sensor_SkeletonFrameReady);
            _sensor.Start();
        }

        static void Sensor_SkeletonFrameReady(object sender, SkeletonFrameReadyEventArgs e)
        {
            if (!_initialized) return;

            List<Skeleton> users = new List<Skeleton>();

            using (var frame = e.OpenSkeletonFrame())
            {
                frame.CopySkeletonDataTo(_skeletons);

                foreach (var user in _skeletons)
                {
                    if (user.TrackingState == SkeletonTrackingState.Tracked)
                    {
                        users.Add(user);
                    }
                }

                if (users.Count > 0)
                {
                    string json = users.Serialize();

                    foreach (var socket in _sockets)
                    {
                        socket.Send(json);
                    }
                }
            }
        }
    }
}
