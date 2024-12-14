using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Principal;
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
            string userSid = WindowsIdentity.GetCurrent().User?.Value;
            string mutexName = $"Global\\ScreenTimeTrayApp_{userSid}";
            bool createdNew;
            Mutex m = new Mutex(true, mutexName, out createdNew);
            if (!createdNew)
            {
                MessageBox.Show(APPDATA_DIR_NAME + " is already running!", "Multiple Instances");
                return;
            }
            MessageBox.Show(APPDATA_DIR_NAME + " is NOT running, starting new instance!", "Multiple Instances");
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
