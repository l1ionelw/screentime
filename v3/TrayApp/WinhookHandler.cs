using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using RestWrapper;
using System.IO;
using System.Net.Http;
using Microsoft.Win32;
using Newtonsoft.Json.Linq;
using System.Security.Policy;

namespace TrayApp
{
    public class WinhookHandler
    {
        static FileLogger appLogger = new FileLogger("log.txt");
        private static readonly HttpClient client = new HttpClient();

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
        string API_URL = "http://localhost:5057/new/appchange/";
        ApplicationInfo appinfo = WindowManager.getWindowTitle();
        long startTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        long endTime;


        public async void WinEventProc(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime)
        {
            endTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            Console.WriteLine("Window title changed");
            // generate data for previous app
            ApplicationInfo applicationInfo = new ApplicationInfo() { fileDescription=appinfo.fileDescription, path=appinfo.path,  productName=appinfo.productName};
            JsonPostData postData = new JsonPostData() { appInfo=applicationInfo, appPath=appinfo.path, endTime=endTime, startTime=startTime };
            // new app and tab times
            string output = JsonConvert.SerializeObject(postData);
            // if less than 3 then skip 
            if (endTime - startTime > 3)
            {
                using (HttpClient client = new HttpClient())
                {
                    // Prepare the content
                    StringContent content = new StringContent(output, Encoding.UTF8, "application/json");

                    try
                    {
                        // Make the POST request asynchronously
                        HttpResponseMessage response = await client.PostAsync(API_URL, content);

                        // Read and print the response content
                        string responseContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Response: {responseContent}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error: {ex.Message}");
                    }
                }
            }
            startTime = endTime;
            appinfo = WindowManager.getWindowTitle();
        }
        #endregion
        public WinhookHandler()
        {
            appLogger.log("Window hook initialized");
            appLogger.log(API_URL);
            dele = new WinEventDelegate(WinEventProc);
            IntPtr m_hhook = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, IntPtr.Zero, dele, 0, 0, WINEVENT_OUTOFCONTEXT);
            // SystemEvents.PowerModeChanged += OnPowerChange;
        }
    }
}
