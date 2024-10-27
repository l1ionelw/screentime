using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ServiceDiscoverer.Properties;
using System.Windows.Forms;
using Salaros.Configuration;
using System.Drawing;

namespace ServiceDiscoverer
{
    internal class TrayApp : ApplicationContext
    {

        private NotifyIcon trayIcon;
        List<Service> list;

        public TrayApp()
        {
            // start up services, which returns back a list of services and names and details about them
            ServiceInitializer init = new ServiceInitializer();
            list = init.InitializeAllServices();


            // initialize tray app icons and propertires
            trayIcon = new NotifyIcon();
            trayIcon.Icon = new Icon("Screentime Service.ico");
            trayIcon.Visible = true;
            ContextMenuStrip contextMenu = new ContextMenuStrip();
            contextMenu.Items.Add("Exit", null, Exit);
            trayIcon.ContextMenuStrip = contextMenu;

            foreach (Service service in list) {
//                menuStrip.Items.Add("Exit "+service.name);
                
            }
        }

        void Exit(object sender, EventArgs e)
        {
            // Hide tray icon, otherwise it will remain shown until user mouses over it
            trayIcon.Visible = false;
            foreach (var service in list)
            {
                Console.WriteLine(service.name);
                if (service.processInfo == null)
                {
                    Console.WriteLine("This service doesnt have a process");
                    continue;
                }
                try
                {

                    service.processInfo.Kill(true);
                } catch 
                {
                    Console.WriteLine("An error occurred while trying to kill process");
                }
                
            }
            Application.Exit();
        }
    }
}
