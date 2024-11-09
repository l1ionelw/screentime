using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

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
            Console.WriteLine("Running tray entrypoint");
            Application.Run(new TrayApplicationContext(args));
        }
    }
}
