using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using static System.Windows.Forms.LinkLabel;

namespace TrayApp
{
    internal class PreAppHandler
    {
        static FileLogger appLogger = new FileLogger("log.txt");
        public ScreenTimeData getAndParseFileContents()
        {
            string currentJsonText = readFromFile("current.json");
            if (currentJsonText == "" || currentJsonText == null) { return new ScreenTimeData() { day = 0, month = 0, year = 0 }; }
            ScreenTimeData dataToCheck = JsonConvert.DeserializeObject<ScreenTimeData>(currentJsonText);
            return dataToCheck;
        }
        public bool isFileToday(ScreenTimeData dataToCheck)
        {
            if (dataToCheck.year == 0)
            {
                return true;
            }
            DateTime rightNow = DateTime.Now;
            if (rightNow.Day != dataToCheck.day || rightNow.Month != dataToCheck.month || rightNow.Year != dataToCheck.year)
            {
                return false;
            }
            return true;
        }
        

        public void moveOldRecord(int day, int month, int year)
        {
            File.WriteAllText($"{month}-{day}-{year}.json", readFromFile("current.json"));
            File.WriteAllText("current.json", "");
        }

        
        public string readFromFile(string fileName)
        {
            string text = "";
            try
            {
                using StreamReader reader = new StreamReader(fileName);
                text = reader.ReadToEnd();
            }
            catch (IOException e)
            {
                appLogger.log("The file could not be read:");
                appLogger.log(e.Message);
            }
            return text;
        }
    }
}
