﻿namespace cs_webserver
{
    public class ScreenTimeStore
    {
        public Dictionary<string, List<string>> appHistory { get; set; }
        public Dictionary<string, List<string>> tabHistory { get; set; }
        public Dictionary<string, AppInfo> appPairs { get; set; }
        public Dictionary<string, TabInfo> tabPairs { get; set; }

    }
    public class AppInfo
    {
        public string path { get; set; }
        public string fileDescription { get; set; }
        public string productName { get; set; }
    }
    public class TabInfo
    {
        public string path { get; set; }
        public string title { get; set; }
    }
}
