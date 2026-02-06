using System;
using System.IO;
using System.Threading;
using System.Collections;


namespace agent_scms_xp.Singleton
{
    class Logger
    {
        private static Mutex mutex = new Mutex();

        private static Logger INSTANCE;
        static bool displayConsole = true;

        private StreamWriter output;
        private StreamReader input;
        private string logFilename;
        private string logDirPath;
        private string logFilePath;
        public string equipInfoDataFileName = "EquipInfoData.json";
        public string equipInfoVersionFileName = "EquipVersionInfo.json";


        public bool MakeStreamWriter() {
            try {
                output = new StreamWriter(logFilePath, true);
                FileStream fileStream = new FileStream(logFilePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                input = new StreamReader(fileStream);
                return true;
            }
            catch {
                return false;
            }
        }

        public Logger()
        {
            logFilename = DateTime.Now.ToString("yyyyMMddHH") + ".txt";
            logDirPath = System.Environment.CurrentDirectory + "\\Log";
            DirectoryInfo di = new DirectoryInfo(logDirPath);
            if (di.Exists == false)
            {
                di.Create();
            }
            logFilePath = logDirPath + "\\" + logFilename;
        }

        public static Logger GetInstance()
        {

            if (INSTANCE == null)
            {
                INSTANCE = new Logger();
            }

            return INSTANCE;
        }

        public void WriteEntry(ArrayList entry)
        {
            string curTime = "[" + DateTime.Now.ToString("HH:mm:ss.fff") + "]";
            IEnumerator line;
            if (displayConsole)
            {
                mutex.WaitOne();
                Console.WriteLine(curTime);
                line = entry.GetEnumerator();
                while (line.MoveNext())
                {
                    Console.WriteLine(line.Current);
                }
                Console.WriteLine();
                mutex.ReleaseMutex();

            }
            LogFilenameCheck();

            mutex.WaitOne();
            output.WriteLine(curTime);
            line = entry.GetEnumerator();
            while (line.MoveNext())
            {
                output.WriteLine(line.Current);
            }
            output.WriteLine();
            output.Flush();
            entry.Clear();

            mutex.ReleaseMutex();
        }

        public void WriteEntry(string entry)
        {
            string curTime = "<br/><b>[" + DateTime.Now.ToString("HH:mm:ss.fff") + "]</b> ";
            if (displayConsole)
            {
                mutex.WaitOne();
                Console.WriteLine(curTime + entry);
                Console.WriteLine();
                mutex.ReleaseMutex();
            }

            LogFilenameCheck();

            entry = curTime + entry;
            mutex.WaitOne();

            output.WriteLine(entry);
            output.WriteLine();
            output.Flush();

            mutex.ReleaseMutex();
        }

        public string ReadTail(long numberOfBytesFromEnd)
        {
            try
            {
                Stream stream = input.BaseStream;
                long length = input.BaseStream.Length;
                if (length < numberOfBytesFromEnd)
                    numberOfBytesFromEnd = length;
                stream.Seek(numberOfBytesFromEnd * -1, SeekOrigin.End);

                int LF = '\n';
                int CR = '\r';
                bool found = false;

                while (!found)
                {
                    int c = stream.ReadByte();
                    if (c == LF || c == -1)
                        found = true;
                }

                string readToEnd = input.ReadToEnd();
                return readToEnd.Replace("\r\n", " ").Replace("\\", "/");
            }
            catch(Exception e)
            {
                Logger.GetInstance().WriteEntry("Exception : " + e.ToString());
                return "Error occured when reading log";
            }
        }

        private void LogFilenameCheck()
        {
            if (logFilename != DateTime.Now.ToString("yyyyMMddHH") + ".txt")
            {
                mutex.WaitOne();
                logFilename = DateTime.Now.ToString("yyyyMMddHH") + ".txt";
                logFilePath = logDirPath + "\\" + logFilename;
                output.Close();
                output = new StreamWriter(logFilePath, true);
                input.Close();
                FileStream fileStream = new FileStream(logFilePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                input = new StreamReader(fileStream);
                mutex.ReleaseMutex();
            }
        }

        public void SetDisplayConsole(bool _displayConsole) { displayConsole = _displayConsole; }
    }
}

