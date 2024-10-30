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
using Flurl.Http;
using Microsoft.Win32;
using System.Windows.Forms;
using static System.Net.WebRequestMethods;

namespace TrayApp
{
    public class WinhookHandler
    {
        static FileLogger appLogger = new FileLogger("log.txt");

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
        // initialize whole app screentimedata
        static DateTime rightNow = DateTime.Now;
        ScreenTimeData screenTimeData = new ScreenTimeData() { appInfoPairs=new Dictionary<string, ApplicationInfo>(), screenTimeData = new Dictionary<string, List<TimeRange>>(), day = rightNow.Day, month=rightNow.Month, year=rightNow.Year };
        //Dictionary<ApplicationInfo, List<TimeRange>> screenTimeData = new Dictionary<ApplicationInfo, List<TimeRange>>();
        int windowsSwitched = 0;

        // init json serializer
        JsonSerializer serializer = new JsonSerializer();

        // first app info = current app
        ApplicationInfo appinfo = WindowManager.getWindowTitle();
        long startTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        long endTime;



        public void WinEventProc(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime)
        {
            endTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            Console.WriteLine("Window title changed");
            Console.WriteLine(appinfo.path);
            Console.WriteLine(appinfo.fileDescription);
            ApplicationInfo thisAppInfo = new ApplicationInfo() { path = appinfo.path, fileDescription = appinfo.fileDescription, productName = appinfo.productName };
            TimeRange appDuration = new TimeRange() { startTime = startTime, endTime = endTime };

            if (appinfo.path==null)
            {
                appinfo.path = "UNKNOWN APP";
            }
            // add to screentimedata 
            if (screenTimeData.screenTimeData.ContainsKey(appinfo.path)) {
                appLogger.log("Dict already contains app, appending to it!");
                screenTimeData.screenTimeData[appinfo.path].Add(appDuration);
            } else
            {
                appLogger.log("Dict DOESNT contain app. Creating new entry");
                List<TimeRange> toInsert = new List<TimeRange>();
                toInsert.Add(appDuration);
                screenTimeData.screenTimeData.Add(appinfo.path, toInsert);
            }

            // add to apppairs
            if (!screenTimeData.appInfoPairs.ContainsKey(appinfo.path))
            {
                appLogger.log("appinfopairs doesnt have this app, adding it");
                screenTimeData.appInfoPairs.Add(appinfo.path, thisAppInfo);
            }

            // TODO: turn whole screentimedata into a json and write it ASYNC
            windowsSwitched++;

            if (windowsSwitched >= 10)
            {
                windowsSwitched = 0;
                appLogger.log("5 or more windows switched, writing to file!");
                string jsonString = JsonConvert.SerializeObject(screenTimeData);
                WriteToFileAsync("current.json", jsonString);
            }

            // update times
            startTime = endTime;
            // current focused window is new focused app
            appinfo = WindowManager.getWindowTitle();

        }

        public static async Task WriteToFileAsync(string path, string value)
        {
            try
            {
                using (StreamWriter writer = new StreamWriter(path, false))
                {
                    await writer.WriteAsync(value);
                }

                Console.WriteLine("Write to file successful!");
                appLogger.log("Write to file successful!");
            }
            catch (Exception ex)
            {
                // Log failure
                Console.WriteLine("Failed writing to file: " + ex.Message);
                appLogger.log("Failed writing to file: " + ex.Message);
            }
        }

        #endregion
        public WinhookHandler()
        {
            /*
            timeEntryMainStore = new TimeEntry();
            timeEntryMainStore.date = DateTime.Now.ToString("M/d/yyyy");
            timeEntryMainStore.appEntry = new Dictionary<string, ApplicationEntry>();
            Console.WriteLine(timeEntryMainStore.appEntry);
            */
            appLogger.log("Application arguments");
            appLogger.log("Window hook initialized");
            
            dele = new WinEventDelegate(WinEventProc);
            IntPtr m_hhook = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, IntPtr.Zero, dele, 0, 0, WINEVENT_OUTOFCONTEXT);
            // SystemEvents.PowerModeChanged += OnPowerChange;
        }
    }
}
