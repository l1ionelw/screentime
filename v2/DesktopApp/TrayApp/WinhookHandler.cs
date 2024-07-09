using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading.Tasks;

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
            foreach (KeyValuePair<ApplicationInfo, ApplicationEntry> entry in timeEntry.appEntry)
            {
                // Console.WriteLine(entry.Key.path);
                Console.WriteLine(entry.Key.fileDescription);
                // Console.WriteLine(entry.Key.productName);
                foreach (TimeRange timerange in entry.Value.timeRange)
                {
                    Console.WriteLine(timerange.startTime + " | " + timerange.endTime);
                }
            }
        }
        #endregion

        #region callback

        TimeEntry timeEntryMainStore;

        long startTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        long endTime;
        public void WinEventProc(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime)
        {
            Console.WriteLine("Window title changed");
            ApplicationInfo appinfo = WindowManager.getWindowTitle();
            Console.WriteLine(appinfo.path);
            Console.WriteLine(appinfo.fileDescription);
            endTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            ModifyTimeObject(appinfo, startTime, endTime);
            startTime = endTime;
        }
        public void ModifyTimeObject(ApplicationInfo appInfo, long appLaunch, long appAway)
        {
            ApplicationEntry appEntry; 
            TimeRange thisTimeRange = new TimeRange();
            thisTimeRange.startTime = appLaunch;
            thisTimeRange.endTime = appAway;
            Console.WriteLine(timeEntryMainStore.appEntry);

            if (!timeEntryMainStore.appEntry.TryGetValue(appInfo, out appEntry))
            {
                // if this app doesnt exist in main time entry
                // then init an empty app entry and add into main store
                Console.WriteLine("app does not exist in current dict");
                appEntry = new ApplicationEntry();
                appEntry.appInfo = appInfo;
                appEntry.timeRange = new List<TimeRange>();
                timeEntryMainStore.appEntry.Add(appInfo, appEntry);
            }
            appEntry.timeRange.Add(thisTimeRange);
            timeEntryMainStore.appEntry[appInfo] = appEntry;
            printEntryStore(timeEntryMainStore);

        }
        #endregion
        public WinhookHandler()
        {
            timeEntryMainStore = new TimeEntry();
            timeEntryMainStore.date = DateTime.Now.ToString("M/d/yyyy");
            timeEntryMainStore.appEntry = new Dictionary<ApplicationInfo, ApplicationEntry>();
            Console.WriteLine(timeEntryMainStore.appEntry);

            Console.WriteLine("Starting window hook");
            dele = new WinEventDelegate(WinEventProc);
            IntPtr m_hhook = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, IntPtr.Zero, dele, 0, 0, WINEVENT_OUTOFCONTEXT);
        }
    }
}
