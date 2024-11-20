using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
using System.Text.Json;
using cs_webserver;

class Program
{
    static AppLogger logger = new AppLogger("log.txt");
    static ScreenTimeStore allStore = new ScreenTimeStore();
    static DateTime CURRENT_DAY = DateTime.Now;
    static int FILESAVE_TIMER_SECONDS = 300;
    static int APP_CHANGE_THRESHOLD = 3;
    static int TAB_CHANGE_THRESHOLD = 3;
    static int APP_CHANGES = 0;
    static int TAB_CHANGES = 0;

    static void Main(string[] args)
    {
        logger.Log("APPLICATION INIT");
        allStore = new ScreenTimeStore()
        {
            appHistory = new Dictionary<string, List<string>>(),
            tabHistory = new Dictionary<string, List<string>>(),
            appPairs = new Dictionary<string, AppInfo>(),
            tabPairs = new Dictionary<string, TabInfo>(),

        };
        DateTime today = DateTime.Now;
        logger.Log("Checking for another entry from today");
        string currentFileName = generateFileNameFromDate(today);
        if (File.Exists(currentFileName))
        {
            logger.Log("entry exists, taking data from session");
            setStoreFromFile(currentFileName);
        }
        logger.Log("-------");
        // logger.Log(JsonSerializer.Serialize(allStore));
        logger.Log("-------");
        logger.Log("Store initialization finished!");
        logger.Log("Webserver: Finding free port");
        int APPLICATION_PORT = getFreePort();
        
        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.ConfigureKestrel((context, serverOptions) =>
        {
            serverOptions.Listen(IPAddress.Loopback, APPLICATION_PORT);
        });
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAllOrigins", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        var app = builder.Build();
        app.UseCors("AllowAllOrigins");

        app.MapGet("/", () => "Screentime API!");

        app.MapGet("/store/", () => JsonSerializer.Serialize(allStore));

        app.MapPost("/new/appchange/", (AppChangeData data) =>
        {
            Debug.WriteLine(data.appPath);
            APP_CHANGES++;
            string appEntry = data.startTime + "|" + data.endTime;
            // entry already exists, append 
            if (allStore.appPairs.ContainsKey(data.appPath))
            {
                var modifiedList = allStore.appHistory[data.appPath];
                modifiedList.Add(appEntry);
                allStore.appHistory[data.appPath] = modifiedList;
            } else
            {
                // doesnt exist, create new entry
                var initialList = new List<string>([appEntry]);
                allStore.appHistory.Add(data.appPath, initialList);
                allStore.appPairs.Add(data.appPath, data.appInfo);
            }
            checkDay();
            backupData();
            return "Response received";
        });

        app.MapPost("/new/tabchange/", (TabChangeData data) =>
        {
            Debug.WriteLine(data.tabUrl);
            TAB_CHANGES++;
            string tabEntry = data.startTime + "|" + data.endTime;
            if (allStore.tabPairs.ContainsKey(data.tabUrl))
            {
                var modifiedList = allStore.tabHistory[data.tabUrl];
                modifiedList.Add(tabEntry);
                allStore.tabHistory[data.tabUrl] = modifiedList;
            }
            else
            {
                // doesnt exist, create new entry
                var initialList = new List<string>([tabEntry]);
                allStore.tabHistory.Add(data.tabUrl, initialList);
                allStore.tabPairs.Add(data.tabUrl, data.tabInfo);
            }
            checkDay();
            backupData();
            return "Response received";
        });

        logger.Log("App started on port: " + APPLICATION_PORT);

        initializeFileBackupTimer();
        app.Run();
    }

    #region postRequestModels
    public class AppChangeData
    {
        public long startTime { get; set; }
        public long endTime { get; set; }
        public string appPath { get; set; }
        public AppInfo appInfo { get; set; }
    }
    public class TabChangeData
    {
        public long startTime { get; set; }
        public long endTime { get; set; }
        public string tabUrl { get; set; }
        public TabInfo tabInfo { get; set; }
    }
    #endregion
    #region utils
    public static async void initializeFileBackupTimer()
    {
        logger.Log("Initializing file timer");
        var timer = new PeriodicTimer(TimeSpan.FromSeconds(FILESAVE_TIMER_SECONDS));

        while (await timer.WaitForNextTickAsync())
        {
            logger.Log("Periodic timer save");

        }
    }
    public static void checkDay()
    {
        logger.Log("Checking today is same day");
        DateTime rightNow = DateTime.Now;
        if (CURRENT_DAY.Year != rightNow.Year || CURRENT_DAY.Month != rightNow.Month || CURRENT_DAY.Day != rightNow.Day)
        {
            CURRENT_DAY = rightNow;
        }
    }
    public static void backupData()
    {
        logger.Log("Writing to file");
        if (APP_CHANGES >= APP_CHANGE_THRESHOLD)
        {
            File.WriteAllText(generateFileNameFromDate(CURRENT_DAY), JsonSerializer.Serialize(allStore));
            APP_CHANGES = 0;
        }
        if (TAB_CHANGES >= TAB_CHANGE_THRESHOLD)
        {
            File.WriteAllText(generateFileNameFromDate(CURRENT_DAY), JsonSerializer.Serialize(allStore));
            TAB_CHANGES = 0;
        }

    }
    public static void setStoreFromFile(string filename)
    {
        // sets allstore to file (usually todays date)
        // returns true on success and false on error
        string fileContents = File.ReadAllText(filename);
        try
        {
            allStore = JsonSerializer.Deserialize<ScreenTimeStore>(fileContents);
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