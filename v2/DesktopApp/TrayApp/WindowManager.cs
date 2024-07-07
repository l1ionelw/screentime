using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace TrayApp

{
    internal class WindowManager
    {
        WinEventDelegate dele = null;
        delegate void WinEventDelegate(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime);

        [DllImport("user32.dll")]
        static extern IntPtr SetWinEventHook(uint eventMin, uint eventMax, IntPtr hmodWinEventProc, WinEventDelegate lpfnWinEventProc, uint idProcess, uint idThread, uint dwFlags);

        private const uint WINEVENT_OUTOFCONTEXT = 0;
        private const uint EVENT_SYSTEM_FOREGROUND = 3;

        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();
        
        public static ApplicationInfo getWindowTitle()
        {
            string applicationPath = UwpUtils.GetProcessFilePath(GetForegroundWindow());
            string fileDescription = applicationPath != null ? FileVersionInfo.GetVersionInfo(applicationPath).FileDescription : null;
            string productName = applicationPath != null ? FileVersionInfo.GetVersionInfo(applicationPath).ProductName : null;
            string appName = fileDescription != null ? fileDescription : applicationPath;
            appName = appName != null ? appName : "Unknown Application";
            ApplicationInfo appInfo = new ApplicationInfo();
            appInfo.path = applicationPath;
            appInfo.productName = productName;
            appInfo.fileDescription = fileDescription;
            return appInfo;
        }
    }
}
