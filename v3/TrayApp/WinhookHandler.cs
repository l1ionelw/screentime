using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Net.Http;


namespace TrayApp
{
    public class WinhookHandler
    {
        static FileLogger appLogger = new FileLogger("trayapplog.txt", "ScreenTime");
        private static readonly HttpClient client = new HttpClient() { Timeout=TimeSpan.FromSeconds(5) };

        #region imports 
        WinEventDelegate dele = null;
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
                    appLogger.log("testing port " + i);
                    // Check if the response is successful
                    if (response.IsSuccessStatusCode)
                    {
                        string text = await response.Content.ReadAsStringAsync();
                        appLogger.log(text);
                        if (text == "Screentime API!")
                        {
                            port = i;
                            API_URL = $"http://localhost:{i}/new/appchange/";
                            appLogger.log($"Found open port: {i}");
                            break;  // Exit loop if a response is received
                        }
                    }
                }
                catch (HttpRequestException)
                {
                    // Ignore if no response (port is closed or unavailable)
                    appLogger.log("Port closed at " + i);
                    continue;
                }

            }
        }
            
        public async void WinEventProc(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime)
        {
            endTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            // generate data for previous app
            ApplicationInfo applicationInfo = new ApplicationInfo() { fileDescription=appinfo.fileDescription, path=appinfo.path,  productName=appinfo.productName};
            JsonPostData postData = new JsonPostData() { appInfo=applicationInfo, appPath=appinfo.path, endTime=endTime, startTime=startTime };
            // new app and tab times
            string output = JsonConvert.SerializeObject(postData);
            
            // if less than 1 second then skip (alt tab or shell host dialog) 
            if (endTime - startTime > 1)
            {
                using (HttpClient client = new HttpClient())
                {
                    // Prepare the content
                    StringContent content = new StringContent(output, Encoding.UTF8, "application/json");

                    try
                    {
                        // Make the POST request asynchronously
                        HttpResponseMessage response = await client.PostAsync(API_URL, content);
                        appLogger.log("Previous: " + applicationInfo.path);

                        // Read and print the response content
                        string responseContent = await response.Content.ReadAsStringAsync();
                        appLogger.log($"Response: {responseContent}");
                    }
                    catch (Exception ex)
                    {
                        appLogger.log($"Error: {ex.Message}");
                    }
                }
            }
            startTime = endTime;
            appinfo = WindowManager.getWindowTitle();
            appLogger.log("Current App: " + appinfo.path);
        }
        #endregion
        public WinhookHandler()
        {
            appLogger.log("Window hook initialized");
            Task.Run(async () => await setApiUrl()).GetAwaiter().GetResult();
            appLogger.log(API_URL);
            dele = new WinEventDelegate(WinEventProc);
            IntPtr m_hhook = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, IntPtr.Zero, dele, 0, 0, WINEVENT_OUTOFCONTEXT);
            // SystemEvents.PowerModeChanged += OnPowerChange;
        }
    }
}
