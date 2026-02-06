using System;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;
using SnapshotService.Utils;

namespace SnapshotService.Core
{
    public class ExcelHost : IDisposable
    {
        public Excel.Application App { get; private set; }

        public ExcelHost()
        {
            try 
            {
                App = new Excel.Application();
                App.Visible = false;
                App.DisplayAlerts = false;
                App.ScreenUpdating = false;
                Logger.GetInstance().Info("Excel Instance Created.");
            }
            catch (Exception ex) 
            {
                Logger.GetInstance().Error("Failed to create Excel Instance: " + ex.Message);
                throw;
            }
        }

        public void Dispose()
        {
            if (App != null)
            {
                try
                {
                    App.Quit();
                    Logger.GetInstance().Info("Excel Instance Quitted.");
                }
                catch (Exception ex)
                {
                    Logger.GetInstance().Error("Error quitting Excel: " + ex.Message);
                }
                finally
                {
                    Release(App);
                    App = null;
                }
            }
            GC.Collect();
            GC.WaitForPendingFinalizers();
        }

        public static void Release(object obj)
        {
            try
            {
                if (obj != null && Marshal.IsComObject(obj))
                {
                    Marshal.ReleaseComObject(obj);
                }
            }
            catch (Exception ex)
            {
                // Last resort logging
                Console.WriteLine("Failed to release object: " + ex.Message);
            }
        }
    }
}
