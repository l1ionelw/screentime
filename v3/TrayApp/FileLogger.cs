using System;
using System.IO;

namespace TrayApp
{
    internal class FileLogger
    {
        string _realFilePath;
        public FileLogger(string path, string APPDATA_FOLDER_NAME) {
            _realFilePath = Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), APPDATA_FOLDER_NAME), path);
        }
        public void log(string content)
        {
            Console.WriteLine(content);
            DateTime now = DateTime.Now;
            string logPrefix = "["+now.ToString("MM-dd-yyyy HH:mm:ss")+"] " + content;
            // writeToFile(logPrefix);
        }
        private void writeToFile(string content)
        {
            using (StreamWriter outputFile = new StreamWriter(_realFilePath, true))
            {
                outputFile.WriteLine(content);
            }
        }
    }
}
