using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using Serilog;
using TrayApp.Properties;

namespace TrayApp
{
    public class TrayApplicationContext : ApplicationContext
    {
        public static NotifyIcon trayIcon { get; set; }

        public TrayApplicationContext(string[] args)
        {
            trayIcon = new NotifyIcon()
            {
                Icon = Resources.AppIconWarning,
                ContextMenuStrip = new ContextMenuStrip()
                {
                    Items = {
                        new ToolStripMenuItem("Open Log File", null, openFolder),
                        new ToolStripMenuItem("Exit", null, Exit)
                    }
                },
                Visible = true
            };

            if (args.Length > 0)
            {
                if (args[0] == "--delayedStart" || args[0] == "--delayStart" || args[0] == "delayedStart" || args[0] == "delayStart")
                {
                    trayIcon.Text = "Screentime - Waiting for server";
                    Log.Information("delaying start");
                    Thread.Sleep(10000); // wait 10 sec
                }
            }
            // trayIcon.Text = "Screentime Tray App";
            trayIcon.Text = "Screentime Error! Server not found";
            Thread.Sleep(10000);

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
        void openFolder(object? sender, EventArgs e)
        {
            string trayAppLogPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "ScreenTime");
            Process.Start("explorer.exe", "/open, " + trayAppLogPath);
        }
        void Exit(object? sender, EventArgs e)
        {
            trayIcon.Visible = false;
            Application.Exit();
        }
    }
}
