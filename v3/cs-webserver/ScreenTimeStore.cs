namespace cs_webserver
{
    public class ScreenTimeStore
    {
        public List<KeyValuePair<string, List<KeyValuePair<long, long>>>> appHistory { get; set; }
        public List<KeyValuePair<string, List<KeyValuePair<long, long>>>> tabHistory { get; set; }
        public List<KeyValuePair<string, AppInfo>> appPairs { get; set; }
        public List<KeyValuePair<string, TabInfo>> tabPairs { get; set; }

    }
    public class AppInfo
    {
        string path { get; set; }
        string fileDescription { get; set; }
        string productName { get; set; }
    }
    public class TabInfo
    {
        string path { get; set; }
        string title { get; set; }
    }
}
