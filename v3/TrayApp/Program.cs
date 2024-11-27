using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TrayApp
{
    public static class Program
    {
        public static string APPDATA_DIR_NAME = "ScreenTime";
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            if (System.Diagnostics.Process.GetProcessesByName(System.IO.Path.GetFileNameWithoutExtension(System.Reflection.Assembly.GetEntryAssembly().Location)).Count() > 1) {
                Console.WriteLine("Another instance already running, quitting");
                return;
            }
            checkAppDataFolder();
            Application.EnableVisualStyles();
            Console.WriteLine("Trayapp is starting");
            Console.WriteLine("Running tray entrypoint");
            Application.Run(new TrayApplicationContext(args));
        }
        public static void checkAppDataFolder()
        {
            string targetDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), APPDATA_DIR_NAME);
            if (!Directory.Exists(targetDirectory))
            {
                Directory.CreateDirectory(targetDirectory);
            }
        }
    }
}
