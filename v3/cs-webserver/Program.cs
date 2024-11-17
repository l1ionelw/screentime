using System.Net;
using System.Net.NetworkInformation;
using System.Text.Json;
using cs_webserver;

class Program
{
    static AppLogger logger = new AppLogger("log.txt");
    static ScreenTimeStore allStore = new ScreenTimeStore();
    static void Main(string[] args)
    {
        logger.Log("APPLICATION INIT");
        allStore = new ScreenTimeStore()
        {
            appHistory = new List<KeyValuePair<string, List<KeyValuePair<long, long>>>>(),
            tabHistory = new List<KeyValuePair<string, List<KeyValuePair<long, long>>>>(),
            appPairs = new List<KeyValuePair<string, AppInfo>>(),
            tabPairs = new List<KeyValuePair<string, TabInfo>>(),

        };
        DateTime today = DateTime.Now;
        logger.Log("Checking for another entry from today");
        string currentFileName = generateFileNameFromDate(today);
        if (File.Exists(currentFileName))
        {
            logger.Log("entry exists, taking data from session");
            setStoreFromFile(currentFileName);
        }
        logger.Log("Store initialization finished!");
        logger.Log("Webserver: Finding free port");
        int APPLICATION_PORT = getFreePort();
        
        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.ConfigureKestrel((context, serverOptions) =>
        {
            serverOptions.Listen(IPAddress.Loopback, APPLICATION_PORT);
        });
        var app = builder.Build();

        app.MapGet("/", () => "Screentime API!");

        logger.Log("App started on port: " + APPLICATION_PORT);
        app.Run();
    }


    #region portUtils
    public static void setStoreFromFile(string filename)
    {
        // sets allstore to file (usually todays date)
        // returns true on success and false on error
        string fileContents = File.ReadAllText(filename);
        try
        {
            ScreenTimeStore deserializedStore = JsonSerializer.Deserialize<ScreenTimeStore>(fileContents);
            allStore = deserializedStore;
            foreach (var item in allStore.appPairs)
            {
                logger.Log(item.Key);
            }
        }
        catch (Exception ex)
        {
            logger.Log("an error occurred while parsing file store! using empty allstore");
            logger.Log(ex.Message);
        }

    }
    public static string generateFileNameFromDate(DateTime date)
    {
        return date.Year + "-" + date.Month + "-" + date.Day + ".json";
    } 
    public static int getFreePort()
    {
        logger.Log("Checking for open port in range 6125 - 6135 (hardcoded)");
        for (int i = 6125; i <= 6135; i++)
        {
            if (isPortOpen(i))
            {
                logger.Log("This port is open: " + i);
                return i;
            }
            else
            {
                logger.Log("This port is not open: " + i);
            }
        }
        return -1;
    }
    public static bool isPortOpen(int port)
    {
        bool portOpen = true;
        IPGlobalProperties ipGlobalProperties = IPGlobalProperties.GetIPGlobalProperties();
        TcpConnectionInformation[] tcpConnInfoArray = ipGlobalProperties.GetActiveTcpConnections();

        foreach (TcpConnectionInformation tcpi in tcpConnInfoArray)
        {
            if (tcpi.LocalEndPoint.Port == port)
            {
                portOpen = false;
                break;
            }
        }
        return portOpen;
    }
    #endregion
}