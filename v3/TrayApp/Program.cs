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
            FileLogger appLogger = new FileLogger("log.txt");
            if (args.Length > 0)
            {
                appLogger.log("Started with args");
                appLogger.log(args[0]);
                System.Diagnostics.Process process = new System.Diagnostics.Process();
                try
                {
                    appLogger.log("starting web browser");
                    process.StartInfo.UseShellExecute = true;
                    process.StartInfo.FileName = "example.html";
                    process.Start();
                }
                catch (Exception e)
                {
                    appLogger.log("error occurred opening web browser");
                    appLogger.log(e.Message);
                }
                appLogger.log("Quitting app");
                Application.Exit();
            } else
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
}
