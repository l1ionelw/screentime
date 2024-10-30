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

    public struct ScreenTimeData
    {
        public int day;
        public int month;
        public int year;
        public Dictionary<string, List<TimeRange>> screenTimeData; // key = app path, value = list of timerange
        public Dictionary<string, ApplicationInfo> appInfoPairs; // app path to app info 
    }

}
