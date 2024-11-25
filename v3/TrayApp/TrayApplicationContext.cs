using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using TrayApp.Properties;

namespace TrayApp
{
    public class TrayApplicationContext : ApplicationContext
    {
        static FileLogger appLogger = new FileLogger("log.txt");
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
            appLogger.log("Application init");
            Console.WriteLine("Starting window event listener");
            new WinhookHandler();
            
        }
        void Exit(object? sender, EventArgs e)
        {
            trayIcon.Visible = false;
            Application.Exit();
        }
    }
}
