using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Win32;

namespace TrayApp
{
    internal static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Console.WriteLine("Trayapp is starting");
            PreAppHandler preAppHandler = new PreAppHandler();
            ScreenTimeData screenTimeData = preAppHandler.getAndParseFileContents();
            bool fileToday = preAppHandler.isFileToday(screenTimeData);
            if (!fileToday)
            {
                preAppHandler.moveOldRecord(screenTimeData.day, screenTimeData.month, screenTimeData.year);
            }
            Application.Run(new TrayApplicationContext());
        }
    }
}
