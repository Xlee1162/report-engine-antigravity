using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Collections.Concurrent;
using System.Text;
using System.Web.Script.Serialization; // Needs reference to System.Web.Extensions
using SnapshotService.Models;
using SnapshotService.Utils;

namespace SnapshotService.Service
{
    public class HttpServer
    {
        private HttpListener _listener;
        private Thread _listenerThread;
        private BlockingCollection<SnapshotRequest> _queue;
        private JavaScriptSerializer _serializer; // Or use Newtonsoft.Json if added via NuGet
        private int _port;

        public HttpServer(int port, BlockingCollection<SnapshotRequest> queue)
        {
            _port = port;
            _queue = queue;
            _serializer = new JavaScriptSerializer();
        }

        public void Start()
        {
            _listener = new HttpListener();
            _listener.Prefixes.Add($"http://*:{_port}/"); // Requires Admin rights usually, or use localhost
            // _listener.Prefixes.Add($"http://localhost:{_port}/");
            
            try 
            {
                _listener.Start();
                Logger.GetInstance().Info($"HTTP Server started on port {_port}");

                _listenerThread = new Thread(ListenLoop);
                _listenerThread.IsBackground = true;
                _listenerThread.Start();
            }
            catch (Exception ex)
            {
                Logger.GetInstance().Error("Failed to start HTTP Server: " + ex.Message);
            }
        }

        private void ListenLoop()
        {
            while (_listener.IsListening)
            {
                try
                {
                    var context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem(HandleRequest, context);
                }
                catch (HttpListenerException)
                {
                    // Listener stopped
                    break;
                }
                catch (Exception ex)
                {
                    Logger.GetInstance().Error("Http Listener Error: " + ex.Message);
                }
            }
        }

        private void HandleRequest(object state)
        {
            var context = (HttpListenerContext)state;
            var req = context.Request;
            var res = context.Response;

            try
            {
                if (req.HttpMethod == "POST" && req.Url.AbsolutePath == "/snapshot")
                {
                    using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
                    {
                        string body = reader.ReadToEnd();
                        var snapshotReq = _serializer.Deserialize<SnapshotRequest>(body);
                        
                        if (snapshotReq != null && !string.IsNullOrEmpty(snapshotReq.inputPath))
                        {
                            _queue.Add(snapshotReq);
                            Logger.GetInstance().Info("Queued Snapshot Request.");
                            
                            SendResponse(res, 200, "{\"success\":true, \"message\":\"Queued\"}");
                        }
                        else
                        {
                            SendResponse(res, 400, "{\"success\":false, \"message\":\"Invalid payload\"}");
                        }
                    }
                }
                else
                {
                     SendResponse(res, 404, "{\"success\":false, \"message\":\"Not Found\"}");
                }
            }
            catch (Exception ex)
            {
                Logger.GetInstance().Error("Request Handling Error: " + ex.Message);
                SendResponse(res, 500, "{\"success\":false, \"message\":\"Internal Error\"}");
            }
        }

        private void SendResponse(HttpListenerResponse res, int statusCode, string json)
        {
            try
            {
                res.StatusCode = statusCode;
                res.ContentType = "application/json";
                byte[] buffer = Encoding.UTF8.GetBytes(json);
                res.ContentLength64 = buffer.Length;
                res.OutputStream.Write(buffer, 0, buffer.Length);
                res.Close();
            }
            catch {}
        }

        public void Stop()
        {
            if (_listener != null && _listener.IsListening)
            {
                _listener.Stop();
                _listener.Close();
            }
        }
    }
}
