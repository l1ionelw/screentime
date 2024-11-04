using NativeMessaging;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TrayApp;

namespace NativeMessagingHost
{
    public class MyHost : Host
    {
        private const bool SendConfirmationReceipt = true;
        
        FileLogger appLogger = new FileLogger("log.txt");
        static string PORT_FILE_PATH = Path.Combine(ReadFile("server_path.txt"),"port.txt");
        //static string PORT_FILE_PATH = "C:\\Users\\yiche\\Documents\\GitHub\\screentime\\v3\\chrome-extension\\express-webserver\\port.txt";
        string port = ReadFile(PORT_FILE_PATH);

        public override string Hostname
        {
            get { return "com.screentime.port"; }
        }

        public MyHost() : base(SendConfirmationReceipt)
        {
            string js = "{port: '" + port.ToString() + "'}";
            appLogger.log(js);
            JObject json = JObject.Parse(js);
            SendMessage(json);
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
