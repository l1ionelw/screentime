using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Net.Http;
using Serilog;
using Microsoft.Win32;
using TrayApp.Properties;
using System.Security.Cryptography.X509Certificates;
using System.IO;


namespace TrayApp
{
    public class WinhookHandler
    {
        private static readonly HttpClient client = new HttpClient() { Timeout=TimeSpan.FromSeconds(5) };

        #region imports 
        static WinEventDelegate dele = null;
        delegate void WinEventDelegate(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime);

        [DllImport("user32.dll")]
        static extern IntPtr SetWinEventHook(uint eventMin, uint eventMax, IntPtr hmodWinEventProc, WinEventDelegate lpfnWinEventProc, uint idProcess, uint idThread, uint dwFlags);

        private const uint WINEVENT_OUTOFCONTEXT = 0;
        private const uint EVENT_SYSTEM_FOREGROUND = 3;

        [DllImport("user32.dll")]
        static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
        #endregion

        #region callback
        string API_URL = "";
        ApplicationInfo appinfo = WindowManager.getWindowTitle();
        long startTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        long endTime;
        static int NUM_REQUEST_TIMEOUT = 0;
        string username = System.Security.Principal.WindowsIdentity.GetCurrent().Name;
        WindowOverlay overlay = new WindowOverlay();

        public async Task setApiUrl ()
        {
            // 6125-6135 port ranges
            int port = -1;
            for (int i = 6125; i <= 6135; i++)
            {
                try
                {
                    // Send a GET request to the current port
                    HttpResponseMessage response = await client.GetAsync($"http://localhost:{i}/");
                    Log.Information("testing port " + i);
                    // Check if the response is successful
                    if (response.IsSuccessStatusCode)
                    {
                        string text = await response.Content.ReadAsStringAsync();
                        Log.Information(text);
                        if (text == "Screentime API!")
                        {
                            port = i;
                            API_URL = $"http://localhost:{i}/new/appchange/";
                            Log.Information($"Found open port: {i}");
                            break;  // Exit loop if a response is received
                        }
                    }
                }
                catch (HttpRequestException)
                {
                    // Ignore if no response (port is closed or unavailable)
                    Log.Information("Port closed at " + i);
                    continue;
                }

            }
        }
        public static async Task MakeApiRequestAsync(string output, string API_URL, ApplicationInfo applicationInfo)
        {
            using (var client = new HttpClient())
            {
                // Prepare the content for the request
                var content = new StringContent(output, Encoding.UTF8, "application/json");

                try
                {
                    // Make the POST request asynchronously
                    HttpResponseMessage response = await client.PostAsync(API_URL, content);

                    // Log the application path
                    Log.Information("Previous: " + applicationInfo.path);

                    // Read and print the response content asynchronously
                    string responseContent = await response.Content.ReadAsStringAsync();
                    Log.Information($"Response: {responseContent}");
                    NUM_REQUEST_TIMEOUT = 0;
                }
                catch (Exception ex)
                {
                    // Log any exceptions that occur during the request
                    Log.Error($"Error: {ex.Message}");
                    NUM_REQUEST_TIMEOUT++;
                }
                updateIconOnServerStatus();
            }
        }

        public static void updateIconOnServerStatus()
        {
            if (NUM_REQUEST_TIMEOUT >= 5)
            {
                TrayApplicationContext.trayIcon.Icon = Resources.AppIconWarning;
                TrayApplicationContext.trayIcon.Text = "Screentime Error! Server not found";
                return;
            }
            TrayApplicationContext.trayIcon.Icon = Resources.AppIcon;
            TrayApplicationContext.trayIcon.Text = "Screentime Tray App";
            return;

        }
        static ApplicationInfo checkApplicationInfo(ApplicationInfo applicationInfo)
        {
            applicationInfo.fileDescription = applicationInfo.fileDescription ?? "UNKNOWN_FILEDESCRIPTION";
            applicationInfo.path = applicationInfo.path ?? "UNKNOWN_PATH";
            applicationInfo.productName = applicationInfo.productName ?? "UNKNOWN_PRODUCTNAME";
            return applicationInfo;
        }

        public async void WinEventProc(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime)
        {
            endTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            // generate data for previous app
            ApplicationInfo applicationInfo = new ApplicationInfo() { fileDescription=appinfo.fileDescription, path=appinfo.path,  productName=appinfo.productName};
            applicationInfo = checkApplicationInfo(applicationInfo);
            JsonPostData postData = new JsonPostData() { appInfo=applicationInfo, appPath=appinfo.path, endTime=endTime, startTime=startTime, username=username };
            // new app and tab times
            string output = JsonConvert.SerializeObject(postData);
            
            // if less than 1 second then skip (alt tab or shell host dialog) 
            if (endTime - startTime > 1)
            {
                Task.Run(async () =>  MakeApiRequestAsync(output, API_URL, applicationInfo));
            }
            startTime = endTime;
            appinfo = WindowManager.getWindowTitle();
            overlay.UpdateText(Path.GetFileName(appinfo.path));
            Log.Information("Current App: " + appinfo.path);
        }
        #endregion

        private void OnPowerModeChanged(object sender, PowerModeChangedEventArgs e)
        {
            switch (e.Mode)
            {
                case PowerModes.Resume:
                    Log.Information("System has resumed from sleep.");
                    break;
                case PowerModes.Suspend:
                    Log.Information("System is going into sleep mode.");
                    endTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                    ApplicationInfo applicationInfo = new ApplicationInfo() { fileDescription = appinfo.fileDescription, path = appinfo.path, productName = appinfo.productName };
                    applicationInfo = checkApplicationInfo(applicationInfo);
                    JsonPostData postData = new JsonPostData() { appInfo = applicationInfo, appPath = appinfo.path, endTime = endTime, startTime = startTime };
                    // new app and tab times
                    string output = JsonConvert.SerializeObject(postData);

                    // if less than 1 second then skip (alt tab or shell host dialog) 
                    if (endTime - startTime > 1)
                    {
                        Task.Run(async () => MakeApiRequestAsync(output, API_URL, applicationInfo));
                    }
                    startTime = endTime;
                    appinfo = new ApplicationInfo() { fileDescription = "WINDOWS_SLEEP", path = "WINDOWS_SLEEP", productName = "WINDOWS_SLEEP" };
                    Log.Information("Current App: " + appinfo.path);
                    break;
                case PowerModes.StatusChange:
                    Log.Information("Power status has changed.");
                    break;
                default:
                    Log.Information("Unknown power mode change detected.");
                    break;
            }
        }

        public WinhookHandler()
        {
            Log.Information("Window hook initialized");
            Task.Run(async () => await setApiUrl()).GetAwaiter().GetResult();
            Log.Information(API_URL);
            Log.Information(username);
            dele = new WinEventDelegate(WinEventProc);
            IntPtr m_hhook = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, IntPtr.Zero, dele, 0, 0, WINEVENT_OUTOFCONTEXT);
            SystemEvents.PowerModeChanged += OnPowerModeChanged;;
            overlay.Show();
        }
    }
}
