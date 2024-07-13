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

namespace TrayApp
{
    public class WinhookHandler
    {
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
        #region debug 
        public void printEntryStore(TimeEntry timeEntry)
        {
            foreach (KeyValuePair<string, ApplicationEntry> entry in timeEntry.appEntry)
            {
                // Console.WriteLine(entry.Key.path);
                Console.WriteLine(entry.Key);
                // Console.WriteLine(entry.Key.productName);
                foreach (TimeRange timerange in entry.Value.timeRange)
                {
                    Console.WriteLine(timerange.startTime + " | " + timerange.endTime);
                }
            }
        }
        #endregion

        #region callback

        ApplicationInfo appinfo = WindowManager.getWindowTitle();
        long startTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        long endTime;

        private void OnPowerChange(object s, PowerModeChangedEventArgs e)
        {
            Console.WriteLine(e.Mode);

            switch (e.Mode)
            {
                case PowerModes.Suspend:
                    Console.WriteLine("Went to sleep");
                    endTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                    ModifyTimeObject(appinfo, startTime, endTime);
                    startTime = endTime;
                    appinfo = new ApplicationInfo();
                    appinfo.path = "WINDOWS_SLEEP";
                    appinfo.fileDescription = "WINDOWS_SLEEP";
                    appinfo.productName = "WINDOWS_SLEEP";
                    break;
            }
        }


        public void WinEventProc(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime)
        {
            Console.WriteLine("Window title changed");
            Console.WriteLine(appinfo.path);
            Console.WriteLine(appinfo.fileDescription);
            endTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            ModifyTimeObject(appinfo, startTime, endTime);
            startTime = endTime;
            appinfo = WindowManager.getWindowTitle();
        }
        public async void ModifyTimeObject(ApplicationInfo appInfo, long appLaunch, long appAway)
        { 
            ApplicationInfo thisAppInfo = new ApplicationInfo();
            thisAppInfo = appInfo;

            TimeRange thisTimeRange = new TimeRange();
            thisTimeRange.startTime = appLaunch;
            thisTimeRange.endTime = appAway;

            SingleAppEntry singleAppEntry = new SingleAppEntry();
            singleAppEntry.appInfo = appInfo;
            singleAppEntry.timeRange = thisTimeRange;

            // string jsonData = JsonConvert.SerializeObject(singleAppEntry);
            string jsonAppInfo = JsonConvert.SerializeObject(appInfo);
            string jsonTimeRange = JsonConvert.SerializeObject(thisTimeRange);
            try
            {
                //var result = await "http://localhost:5000/api/entry/".PostJsonAsync(new {data= jsonData });
                var result = await "http://localhost:52879/api/entry/".PostJsonAsync(new {appInfo=jsonAppInfo, timeRange=jsonTimeRange});
            } catch (FlurlHttpException ex) {
                Console.WriteLine(ex.Message);
                Console.WriteLine(ex.StatusCode);
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

            Console.WriteLine("Starting window hook");
            dele = new WinEventDelegate(WinEventProc);
            IntPtr m_hhook = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, IntPtr.Zero, dele, 0, 0, WINEVENT_OUTOFCONTEXT);
            SystemEvents.PowerModeChanged += OnPowerChange;
        }
    }
}
