using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
using System.Text.Json;
using System.Text.Json.Serialization;
using cs_webserver;
using Serilog.Events;
using Serilog.Formatting.Json;
using Serilog;
using Microsoft.AspNetCore.Mvc;

class Program
{
    public static string commonPath = Path.GetFullPath(Path.Combine(System.Environment.GetFolderPath(Environment.SpecialFolder.CommonDocuments), @"..\"));
    public static string logFilePath = Path.Combine(commonPath, "ScreenTime\\serverlog.json");
    public static string APPDATA_DIR_PATH = Path.Combine(commonPath, "ScreenTime");
    // static AppLogger logger = new AppLogger("serverlog.txt", APPDATA_DIR_PATH);
    static ScreenTimeStore allStore = new ScreenTimeStore();
    static DateTime CURRENT_DAY = DateTime.Now;
    static int FILESAVE_TIMER_SECONDS = 300;
    static int APP_CHANGE_THRESHOLD = 5;
    static int TAB_CHANGE_THRESHOLD = 5;
    static int APP_CHANGES = 0;
    static int TAB_CHANGES = 0;
    static JsonSerializerOptions serializerIgnoreNull = new JsonSerializerOptions() { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
    

    static void Main(string[] args)
    {
        bool createdNew;
        string mutexString = "Global\\ScreenTimeServer";
        Mutex m = new Mutex(true, mutexString, out createdNew);

        Log.Logger = new LoggerConfiguration()
                            // add console as logging target
                            .WriteTo.Console()
                            // add a logging target for warnings and higher severity  logs
                            // structured in JSON format
                            .WriteTo.File(new JsonFormatter(),
                                          logFilePath,
                                          restrictedToMinimumLevel: LogEventLevel.Debug)
                            // set default minimum level
                            .MinimumLevel.Debug()
                            .CreateLogger();

        if (!createdNew)
        {
            Log.Error("A GLOBAL INSTANCE IS ALREADY RUNNING! TERMINATING!");
            return;
        }
        
        checkAppDataFolder(APPDATA_DIR_PATH);
        Log.Information("APPLICATION INIT");
        allStore = new ScreenTimeStore()
        {
            appHistory = new Dictionary<string, List<string>>(),
            tabHistory = new Dictionary<string, List<string>>(),
            appPairs = new Dictionary<string, AppInfo>(),
            tabPairs = new Dictionary<string, TabInfo>(),

        };
        Log.Information("Checking for another entry from today");
        string currentFileName = generateAppDataFilePath(generateFileNameFromDate(CURRENT_DAY));
        if (File.Exists(currentFileName))
        {
            Log.Information("entry exists, taking data from session");
            setStoreFromFile(currentFileName);
        }
        Log.Information("-------");
        // logger.Log(JsonSerializer.Serialize(allStore));
        Log.Information("-------");
        Log.Information("Store initialization finished!");
        Log.Information("Webserver: Finding free port");
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

        app.MapGet("/store/", () => JsonSerializer.Serialize(allStore,serializerIgnoreNull));

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
            Debug.WriteLine("checkday");
            checkDay();
            Debug.WriteLine("backupdata");
            backupData();
            return "Response received";
        });

        app.MapPost("/new/tabchange/", (TabChangeData data) =>
        {
            
            Debug.WriteLine(data.tabUrl);
            Debug.WriteLine(data.tabInfo);
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

        app.MapGet("/filestore/{filename}.json", (string filename) =>
        {
            // Construct the file path using the filename
            var filePath = Path.Combine(APPDATA_DIR_PATH, $"{filename}.json");

            // Check if the file exists
            if (File.Exists(filePath))
            {
                // Read the content of the file and return it as JSON
                var content = File.ReadAllText(filePath);
                return Results.Content(content, "application/json");
            }
            else
            {
                // Return a 404 if the file doesn't exist
                return Results.NotFound();
            }
        });

        app.MapGet("/limits/", () =>
        {
            string timeLimitsFilePath = generateAppDataFilePath("limits.json");
            if (File.Exists(timeLimitsFilePath))
            {
                var content = JsonSerializer.Serialize(File.ReadAllText(timeLimitsFilePath), serializerIgnoreNull);
                return Results.Content(content, "application/json");
            }
            return Results.NotFound();
        });

        app.MapPost("/limits/add/", (LimitData data) =>
        {
            Debug.WriteLine(" in here");
            Debug.WriteLine(JsonSerializer.Serialize(data));
            // validate hours and minutes are valid
            if (data.allowHours < 0 || data.allowMinutes < 0 || data.allowHours >= 24 || data.allowMinutes > 60)
            {
                return Results.Problem("The time limit set is invalid");
            }
            // check and read json from limits.json
            string timeLimitsFilePath = generateAppDataFilePath("limits.json");
            LimitInfo limits = new LimitInfo()
            {
                appLimits = new Dictionary<string, string>(),
                websiteLimits = new Dictionary<string, string>()
            };
            if (File.Exists(timeLimitsFilePath))
            {
                limits = JsonSerializer.Deserialize<LimitInfo>(File.ReadAllText(timeLimitsFilePath));
            }
            // if exists, change value, otherwise append new entry
            string timeLimitString = data.allowHours.ToString() + "|" + data.allowMinutes.ToString();
            if (data.type == "Website")
            {
                if (limits.websiteLimits.ContainsKey(data.path)) limits.websiteLimits[data.path] = timeLimitString;
                else limits.websiteLimits.Add(data.path, timeLimitString);
            }
            else if (data.type == "App")
            {
                if (limits.appLimits.ContainsKey(data.path)) limits.websiteLimits[data.path] = timeLimitString;
                else limits.appLimits.Add(data.path, timeLimitString);
            } else
            {
                Debug.WriteLine("category mismatch");
                return Results.Problem("CATEGORY MISMATCH");
            }
            // write back to json
            File.WriteAllText(timeLimitsFilePath, JsonSerializer.Serialize(limits, serializerIgnoreNull));
            return Results.Ok();
        });

        Log.Information("App started on port: " + APPLICATION_PORT);

        initializeFileBackupTimer();
        try
        {
            app.Run();
        } catch (Exception e)
        {
            Log.Fatal("AN ERROR OCCURRED");
            Log.Fatal(e.ToString());
            Log.Fatal(e.Message);
            return;
        }
        
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
    public class LimitData
    {
        public string type { get; set; }
        public string path { get; set; }
        public int allowHours { get; set; }
        public int allowMinutes { get; set; }
    }
    #endregion
    #region utils
    public static void checkAppDataFolder(string targetDirectory)
    {
        if (!Directory.Exists(targetDirectory))
        {
            Directory.CreateDirectory(targetDirectory);
        }
    }
    public static async void initializeFileBackupTimer()
    {
        Log.Information("Initializing file timer");
        string currentDayFile = generateAppDataFilePath(generateFileNameFromDate(CURRENT_DAY));
        var timer = new PeriodicTimer(TimeSpan.FromSeconds(FILESAVE_TIMER_SECONDS));

        while (await timer.WaitForNextTickAsync())
        {
            Log.Information("Periodic timer save: " + currentDayFile);
            File.WriteAllText(currentDayFile, JsonSerializer.Serialize(allStore, serializerIgnoreNull));
        }
    }
    public static void checkDay()
    {
        Log.Information("Checking today is same day");
        DateTime rightNow = DateTime.Now;
        if (CURRENT_DAY.Year != rightNow.Year || CURRENT_DAY.Month != rightNow.Month || CURRENT_DAY.Day != rightNow.Day)
        {
            Log.Information("NOT SAME DAY");
            Log.Information("Saving current store to json");
            File.WriteAllText(generateAppDataFilePath(generateFileNameFromDate(CURRENT_DAY)), JsonSerializer.Serialize(allStore, serializerIgnoreNull));
            Log.Information("Erasing allstore and changing day");
            allStore = new ScreenTimeStore()
            {
                appHistory = new Dictionary<string, List<string>>(),
                tabHistory = new Dictionary<string, List<string>>(),
                appPairs = new Dictionary<string, AppInfo>(),
                tabPairs = new Dictionary<string, TabInfo>(),

            };
            CURRENT_DAY = rightNow;
        }
    }
    public static void backupData()
    {
        Debug.WriteLine("Backup data called");
        string currentDayFile = generateAppDataFilePath(generateFileNameFromDate(CURRENT_DAY));
        Log.Information("Writing to file: " + currentDayFile);
        if (APP_CHANGES >= APP_CHANGE_THRESHOLD)
        {
            File.WriteAllText(currentDayFile, JsonSerializer.Serialize(allStore, serializerIgnoreNull));
            APP_CHANGES = 0;
        }
        if (TAB_CHANGES >= TAB_CHANGE_THRESHOLD)
        {
            File.WriteAllText(currentDayFile, JsonSerializer.Serialize(allStore, serializerIgnoreNull));
            TAB_CHANGES = 0;
        }

    }
    public static void setStoreFromFile(string filename)
    {
        // sets allstore to file (usually todays date)
        // returns true on success and false on error
        string fileContents = File.ReadAllText(generateAppDataFilePath(filename));
        try
        {
            allStore = JsonSerializer.Deserialize<ScreenTimeStore>(fileContents);
        }
        catch (Exception ex)
        {
            Log.Information("an error occurred while parsing file store! using empty allstore");
            Log.Information(ex.Message);
        }

    }
    public static string generateFileNameFromDate(DateTime date)
    {
        return date.Year + "-" + date.Month + "-" + date.Day + ".json";
    } 
    public static string generateAppDataFilePath(string filename)
    {
        return Path.Combine(APPDATA_DIR_PATH, filename);
    }
    public static int getFreePort()
    {
        Log.Information("Checking for open port in range 6125 - 6135 (hardcoded)");
        for (int i = 6125; i <= 6135; i++)
        {
            if (isPortOpen(i))
            {
                Log.Information("This port is open: " + i);
                return i;
            }
            else
            {
                Log.Information("This port is not open: " + i);
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