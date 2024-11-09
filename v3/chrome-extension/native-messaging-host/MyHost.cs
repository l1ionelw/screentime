using NativeMessaging;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using TrayApp;

namespace NativeMessagingHost
{
    public class MyHost : Host
    {
        private const bool SendConfirmationReceipt = true;
        
        FileLogger appLogger = new FileLogger("log.txt");
        static string PORT_FILE_PATH = "C:\\Users\\yiche\\Documents\\GitHub\\screentime\\v3\\chrome-extension\\express-webserver\\port.txt";
        string port = getApiUrl();
        public static string getApiUrl()
        {
            string PORT = "null";
            string path = System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            // get current exe dir
            path = Path.GetFullPath(Path.Combine(path, @"..\..\..\..\"));
            path = Path.GetFullPath(Path.Combine(path, @"express-webserver\port.txt"));
            if (File.Exists(path))
            {
                Console.WriteLine("exists, reading from it!");
                PORT = File.ReadAllText(path);
            }
            return PORT.ToString();
        }

        public override string Hostname
        {
            get { return "com.screentime.port"; }
        }

        public MyHost() : base(SendConfirmationReceipt)
        {
            string js = "{'text': "+ "'port'" +"}";
            appLogger.log(js);
            JObject json = JObject.Parse(js);
            appLogger.log(json.ToString());
            JObject hi = new JObject()
            {
                {"port",1233 }
            };
            SendMessage(hi);
        }

        protected override void ProcessReceivedMessage(JObject data)
        {
            appLogger.log("recieved data: " + data.ToString());
            SendMessage(data);
        }
        public static string ReadFile(string filePath)
        {
            FileLogger appLogger = new FileLogger("log.txt");
            try
            {
                // Read the contents of the file synchronously
                string content = File.ReadAllText(filePath);
                return content;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
                appLogger.log(ex.Message);
                return null;
            }
        }

    }
}
