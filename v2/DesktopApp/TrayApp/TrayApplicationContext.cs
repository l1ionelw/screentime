using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using TrayApp.Properties;

namespace TrayApp
{
    public class TrayApplicationContext : ApplicationContext
    {
        private NotifyIcon trayIcon;

        public TrayApplicationContext()
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
            new WinhookHandler();
        }

        void Exit(object? sender, EventArgs e)
        {
            trayIcon.Visible = false;
            Application.Exit();
        }
    }
}
