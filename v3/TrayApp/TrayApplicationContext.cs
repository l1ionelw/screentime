using System;
using System.Threading;
using System.Windows.Forms;
using Serilog;
using TrayApp.Properties;

namespace TrayApp
{
    public class TrayApplicationContext : ApplicationContext
    {
        static FileLogger appLogger = new FileLogger("trayapplog.txt", "ScreenTime");
        private NotifyIcon trayIcon;

        public TrayApplicationContext(string[] args)
        {
            trayIcon = new NotifyIcon()
            {
                Icon = Resources.AppIcon,
                ContextMenuStrip = new ContextMenuStrip()
                {
                    Items = { new ToolStripMenuItem("Exit", null, Exit) }
                },
                Visible = true
            };

            if (args.Length > 0)
            {
                if (args[0] == "--delayedStart" || args[0] == "--delayStart" || args[0] == "delayedStart" || args[0] == "delayStart")
                {
                    trayIcon.Text = "Screentime - Waiting for server";
                    appLogger.log("delaying start");
                    Thread.Sleep(10000); // wait 10 sec
                }
            }
            trayIcon.Text = "Screentime";
            Log.Information("Application Init");
            Console.WriteLine("Starting window event listener");
            try
            {
                new WinhookHandler();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex.ToString());
                Log.Fatal(ex.StackTrace);
                Log.Fatal(ex.Message);
                return;
            }
            
            
        }
        void Exit(object? sender, EventArgs e)
        {
            trayIcon.Visible = false;
            Application.Exit();
        }
    }
}
