using System;
using System.IO;
using System.Security.Principal;
using System.Threading;
using System.Windows.Forms;
using Serilog;
using Serilog.Events;
using Serilog.Formatting.Json;

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
                // MessageBox.Show(APPDATA_DIR_NAME + " is already running!", "Multiple Instances");
                return;
            }
            // MessageBox.Show(APPDATA_DIR_NAME + " is NOT running, starting new instance!", "Multiple Instances");
            string logFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "ScreenTime\\trayapplog.json");
            Log.Logger = new LoggerConfiguration()
                            // add console as logging target
                            .WriteTo.Console()
                            // add a logging target for warnings and higher severity  logs
                            // structured in JSON format
                            .WriteTo.File(new JsonFormatter(),
                                          logFilePath,
                                          restrictedToMinimumLevel: LogEventLevel.Debug)
                            // set default minimum level
                            .MinimumLevel.Debug()
                            .CreateLogger();


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
