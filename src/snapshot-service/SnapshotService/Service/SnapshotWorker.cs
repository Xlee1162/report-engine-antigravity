using System;
using System.Collections.Concurrent;
using System.Threading;
using System.IO;
using Excel = Microsoft.Office.Interop.Excel;
using SnapshotService.Models;
using SnapshotService.Core;
using SnapshotService.Utils;

namespace SnapshotService.Service
{
    public class SnapshotWorker
    {
        private BlockingCollection<SnapshotRequest> _queue;
        private Thread _workerThread;
        private CancellationTokenSource _cts;

        public SnapshotWorker(BlockingCollection<SnapshotRequest> queue)
        {
            _queue = queue;
            _cts = new CancellationTokenSource();
        }

        public void Start()
        {
            _workerThread = new Thread(ProcessQueue);
            _workerThread.SetApartmentState(ApartmentState.STA); // Essential for COM
            _workerThread.IsBackground = true;
            _workerThread.Start();
            Logger.GetInstance().Info("SnapshotWorker Started (STA Thread).");
        }

        public void Stop()
        {
            _cts.Cancel();
            _workerThread.Join(5000);
        }

        private void ProcessQueue()
        {
            // Keep Excel open as long as possible for performance?
            // Strategy: Open once, reuse, restart if error.
            
            ExcelHost excel = null;

            while (!_cts.Token.IsCancellationRequested)
            {
                try
                {
                    SnapshotRequest request = _queue.Take(_cts.Token);
                    
                    if (excel == null) excel = new ExcelHost();

                    ProcessRequest(excel, request);
                }
                catch (OperationCanceledException)
                {
                    Logger.GetInstance().Info("Worker Cancellation Requested.");
                    break;
                }
                catch (Exception ex)
                {
                    Logger.GetInstance().Error("Critical Worker Error: " + ex.Message);
                    
                    // If App crashed, dispose and nullify to recreate next loop
                    if (excel != null) 
                    {
                        excel.Dispose();
                        excel = null;
                    }
                    Thread.Sleep(2000); // Backoff
                }
            }

            // Cleanup on exit
            if (excel != null) excel.Dispose();
        }

        private void ProcessRequest(ExcelHost host, SnapshotRequest req)
        {
            Logger.GetInstance().Info("Processing file: " + req.inputPath);
            
            Excel.Workbook wb = null;
            try
            {
                if (!File.Exists(req.inputPath))
                {
                    Logger.GetInstance().Error("File not found: " + req.inputPath);
                    return;
                }

                wb = host.App.Workbooks.Open(req.inputPath, ReadOnly: true);

                foreach (var item in req.items)
                {
                    try
                    {
                        Excel.Worksheet sheet = (Excel.Worksheet)wb.Sheets[item.sheet];
                        
                        if (item.type == "chart")
                        {
                            Excel.ChartObjects chartObjects = (Excel.ChartObjects)sheet.ChartObjects();
                            Excel.ChartObject chartObj = chartObjects.Item(item.name);
                            
                            // Ensure output dir exists
                            Directory.CreateDirectory(Path.GetDirectoryName(item.outputPath));
                            
                            // Export
                            chartObj.Chart.Export(item.outputPath, "PNG", false);
                            Logger.GetInstance().Info($"Exported Chart '{item.name}' to {item.outputPath}");
                            
                            ExcelHost.Release(chartObj);
                            ExcelHost.Release(chartObjects);
                        }
                        // Add Range support here if needed
                        
                        ExcelHost.Release(sheet);
                    }
                    catch (Exception ex)
                    {
                        Logger.GetInstance().Error($"Failed to export item '{item.name}': {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.GetInstance().Error("Error opening workbook: " + ex.Message);
                throw; // Rethrow to trigger outer loop recovery
            }
            finally
            {
                if (wb != null)
                {
                    wb.Close(SaveChanges: false);
                    ExcelHost.Release(wb);
                }
            }
        }
    }
}
