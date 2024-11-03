using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Win32;
using NativeMessaging;
using NativeMessagingHost;
using Newtonsoft.Json;

namespace TrayApp
{
    class Program
    {
        static public string AssemblyLoadDirectory
        {
            get
            {
                string codeBase = Assembly.GetEntryAssembly().CodeBase;
                UriBuilder uri = new UriBuilder(codeBase);
                string path = Uri.UnescapeDataString(uri.Path);
                return Path.GetDirectoryName(path);
            }
        }

        static public string AssemblyExecuteablePath
        {
            get
            {
                string codeBase = Assembly.GetEntryAssembly().CodeBase;
                UriBuilder uri = new UriBuilder(codeBase);
                return Uri.UnescapeDataString(uri.Path);
            }
        }

        static Host Host;

        static string[] AllowedOrigins = new string[] { "chrome-extension://ccajjfgdplbgakojnhgodjpccjdnblpg/" };
        static string Description = "Description Goes Here";

        static void Main(string[] args)
        {
            Host = new MyHost();
            Host.SupportedBrowsers.Add(ChromiumBrowser.GoogleChrome);
            Host.SupportedBrowsers.Add(ChromiumBrowser.MicrosoftEdge);

            if (args.Contains("--register"))
            {
                Host.GenerateManifest(Description, AllowedOrigins);
                Host.Register();
            }
        }
    }

}
