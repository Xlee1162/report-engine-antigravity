using System;
using System.IO;
using System.Threading;
using System.Collections;

namespace SnapshotService.Utils
{
    class Logger
    {
        private static Mutex mutex = new Mutex();
        private static Logger INSTANCE;
        
        // Config
        static bool displayConsole = true;
        private StreamWriter output;
        
        // Paths
        private string logFilename;
        private string logDirPath;
        private string logFilePath;

        public Logger()
        {
            // Initialize paths
            logFilename = DateTime.Now.ToString("yyyyMMddHH") + ".txt";
            logDirPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Log");
            
            DirectoryInfo di = new DirectoryInfo(logDirPath);
            if (di.Exists == false)
            {
                di.Create();
            }
            logFilePath = Path.Combine(logDirPath, logFilename);
            
            MakeStreamWriter();
        }

        public bool MakeStreamWriter() {
            try {
                // Ensure directory exists again just in case
                if (!Directory.Exists(logDirPath)) Directory.CreateDirectory(logDirPath);
                
                output = new StreamWriter(logFilePath, true) { AutoFlush = true };
                return true;
            }
            catch (Exception ex) {
                Console.WriteLine("Failed to create log writer: " + ex.Message);
                return false;
            }
        }

        public static Logger GetInstance()
        {
            if (INSTANCE == null)
            {
                lock(typeof(Logger)) 
                {
                    if (INSTANCE == null) INSTANCE = new Logger();
                }
            }
            return INSTANCE;
        }

        private void LogFilenameCheck()
        {
            // Rotate log if hour changed
            string currentName = DateTime.Now.ToString("yyyyMMddHH") + ".txt";
            if (logFilename != currentName)
            {
                mutex.WaitOne();
                try 
                {
                    if (output != null) output.Close();
                    
                    logFilename = currentName;
                    logFilePath = Path.Combine(logDirPath, logFilename);
                    MakeStreamWriter();
                }
                finally 
                {
                    mutex.ReleaseMutex();
                }
            }
        }

        public void WriteEntry(string entry)
        {
            string timeStr = DateTime.Now.ToString("HH:mm:ss.fff");
            string consoleOutput = $"[{timeStr}] {entry}";
            string fileOutput = $"<br/><b>[{timeStr}]</b> {entry}"; // Keep HTML format as per original

            if (displayConsole)
            {
                mutex.WaitOne();
                try 
                {
                    Console.WriteLine(consoleOutput);
                }
                finally 
                {
                    mutex.ReleaseMutex();
                }
            }

            LogFilenameCheck();

            mutex.WaitOne();
            try 
            {
                if (output != null) 
                {
                    output.WriteLine(fileOutput);
                    // output.WriteLine(); // Add empty line if needed, removed for compactness
                }
            }
            finally 
            {
                mutex.ReleaseMutex();
            }
        }

        public void Error(string msg) 
        {
            WriteEntry("[ERROR] " + msg);
        }
        
        public void Info(string msg) 
        {
            WriteEntry("[INFO] " + msg);
        }
    }
}
