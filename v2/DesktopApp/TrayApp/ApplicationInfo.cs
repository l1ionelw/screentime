using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TrayApp
{
    public struct ApplicationInfo
    {
        public string path;
        public string fileDescription;
        public string productName;
    }
    public struct TimeRange
    {
        public long startTime;
        public long endTime;
    }

    public struct SingleAppEntry
    {
        public ApplicationInfo appInfo;
        public TimeRange timeRange;
    }

    // ---------------- Depreciated
    public struct ApplicationEntry
    {
        public ApplicationInfo appInfo;
        public List<TimeRange> timeRange;   
    }
    public struct TimeEntry 
    {
        public string date;
        public Dictionary<string, ApplicationEntry> appEntry;
    }
}
