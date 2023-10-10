using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Threading;

namespace screentime
{
    public struct WindowGroup
    {
        public string CurrentWindow;
        public DateTime CurrentWindowTime;
        public string NewWindow;
        public DateTime NewWindowTime;
    }

    public class WindowDetectWorker
    {
        WindowDetect WindowDetect = new WindowDetect();
        WindowGroup WindowGroup = new WindowGroup();
        TimeStruct TimeStruct = new TimeStruct();
        static IntPtr m_hhook;
        static WinEventDelegate dele;
        public bool SaveThreadStopped = false, m_hhook_unhooked = false, DelayDetectThread = false;
        public static Thread? SaveThread, DayThread;


        public void Worker()
        {
            // TODO: move these to an initialize function
            // TimeStruct = PreAppWorker.GetScreenTimeSave();
            TimeStruct = PreAppWorker.GetScreenTimeSave();
            Console.WriteLine("screen time save done");
            dele = new WinEventDelegate(WinEventProc);
            m_hhook = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, IntPtr.Zero, dele, 0, 0,
                WINEVENT_OUTOFCONTEXT);
            SaveThread = new Thread(WriteToFile);
            SaveThread.Start();
            Console.WriteLine("starting day thread");
            DayThread = new Thread(IsNewDay);
            DayThread.Start();
        }

        delegate void WinEventDelegate(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild,
            uint dwEventThread, uint dwmsEventTime);

        [DllImport("user32.dll")]
        static extern IntPtr SetWinEventHook(uint eventMin, uint eventMax, IntPtr hmodWinEventProc,
            WinEventDelegate lpfnWinEventProc, uint idProcess, uint idThread, uint dwFlags);

        private const uint WINEVENT_OUTOFCONTEXT = 0;
        private const uint EVENT_SYSTEM_FOREGROUND = 3;


        public void WinEventProc(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild,
            uint dwEventThread, uint dwmsEventTime)
        {
            if (m_hhook_unhooked)
            {
                return;
            }

            DateTime CurrentTime = DateTime.Now;
            string CurrentApp = WindowDetect.getCurrentAppName();
            Console.WriteLine(CurrentApp);
            WindowGroup.NewWindow = CurrentApp;
            WindowGroup.NewWindowTime = CurrentTime;
            Dictionary<DateTime, DateTime> TimeValues = new Dictionary<DateTime, DateTime>();

            // CHECKS -------------------------------------------
            if (CurrentApp == null)
            {
                return;
            }

            if (WindowGroup.CurrentWindow == "")
            {
                WindowGroup.CurrentWindow = WindowGroup.NewWindow;
                WindowGroup.CurrentWindowTime = WindowGroup.NewWindowTime;
                return;
            }

            if (WindowGroup.CurrentWindowTime == default)
            {
                WindowGroup.CurrentWindowTime = WindowGroup.NewWindowTime;
                WindowGroup.CurrentWindow = WindowGroup.NewWindow;
                return;
            }

            if (TimeStruct.Apps.ContainsKey(CurrentApp))
            {
                TimeValues = TimeStruct.Apps[CurrentApp];
            }
            else
            {
                // assign current empty timevalues to current app
                TimeStruct.Apps.Add(CurrentApp, TimeValues);
            }

            // END CHECKS -------------------------------------------

            TimeValues.Add(WindowGroup.CurrentWindowTime, WindowGroup.NewWindowTime);
            TimeStruct.Apps[CurrentApp] = TimeValues;
            WindowGroup.CurrentWindow = WindowGroup.NewWindow;
            WindowGroup.CurrentWindowTime = WindowGroup.NewWindowTime;

            var options = new JsonSerializerOptions();
            options.WriteIndented = true;
            string jsonString = JsonSerializer.Serialize(TimeStruct, options);
            Console.WriteLine(jsonString);
        }

        public void WriteToFile()
        {
            while (!SaveThreadStopped)
            {
                Thread.Sleep(10000);
                using (StreamWriter writer = new StreamWriter("current.json"))
                {
                    // TODO: turn write to file into a seperate func
                    var options = new JsonSerializerOptions();
                    options.WriteIndented = true;
                    string jsonString = JsonSerializer.Serialize(TimeStruct, options);
                    writer.WriteLine(jsonString);
                    Console.WriteLine("string contents written to file!");
                }
            }

            // last save after save thread is stopped
            using (StreamWriter writer = new StreamWriter("current.json"))
            {
                // TODO: turn write to file into a seperate func
                var options = new JsonSerializerOptions();
                options.WriteIndented = true;
                string jsonString = JsonSerializer.Serialize(TimeStruct, options);
                writer.WriteLine(jsonString);
                Console.WriteLine("string contents written to file!");
            }
        }

        public void IsNewDay()
        {
            Console.WriteLine("inside thread - starting while true loop");
            while (true)
            {
                if (!DelayDetectThread)
                {
                    DateTime current = DateTime.Now;
                    Console.WriteLine(current.ToString("HH"));
                    Console.WriteLine(current.ToString("HH") == "00");
                    if (current.ToString("HH") == "00")
                    {
                        Console.WriteLine("It is 12 o clock");
                        SaveThreadStopped = true;
                        m_hhook_unhooked = true;
                        Thread.Sleep(3000);
                        TimeStruct = PreAppWorker.GetScreenTimeSave();
                        m_hhook_unhooked = false;
                        SaveThreadStopped = false;
                        Console.WriteLine(SaveThread.IsAlive);
                        if (!SaveThread.IsAlive)
                        {
                            Console.Write("Save thread is dead! starting a new one!");
                            SaveThread = new Thread(WriteToFile);
                            SaveThread.Start();
                        }

                        DelayDetectThread = true;
                    }
                }
                else
                {
                    Thread.Sleep(3700000);
                    DelayDetectThread = true;
                }

                Thread.Sleep(2000);
            }
        }
    }
}