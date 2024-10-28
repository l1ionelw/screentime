using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TrayApp
{
    internal class FileLogger
    {
        string loggerPath;
        public FileLogger(string path) {
            loggerPath = path;
        }
        public void log(string content)
        {
            DateTime now = DateTime.Now;
            string logPrefix = "["+now.ToString("MM-dd-yyyy HH:mm:ss")+"] " + content;
            writeToFile(logPrefix);
        }
        public void writeToFile(string content)
        {
            using (StreamWriter outputFile = new StreamWriter(loggerPath, true))
            {
                outputFile.WriteLine(content);
            }
        }
    }
}
