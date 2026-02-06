using System;
using System.Collections.Concurrent;
using System.Threading;
using SnapshotService.Models;
using SnapshotService.Service;
using SnapshotService.Utils;

namespace SnapshotService
{
    class Program
    {
        static void Main(string[] args)
        {
            // Initialize Logger
            Logger.GetInstance().Info("=== Snapshot Service Starting ===");

            // Shared Queue
            var queue = new BlockingCollection<SnapshotRequest>();

            // Start Worker
            var worker = new SnapshotWorker(queue);
            worker.Start();

            // Start Http Server
            int port = 7000; // Updated Port
            var server = new HttpServer(port, queue);
            server.Start();

            Logger.GetInstance().Info("Service Running. Press [Enter] to exit.");
            Console.ReadLine();

            Logger.GetInstance().Info("Stopping Service...");
            server.Stop();
            worker.Stop();
            Logger.GetInstance().Info("Exited.");
        }
    }
}
