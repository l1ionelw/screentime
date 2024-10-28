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
        public override string ToString()
        {
            return $"{path}|||||{fileDescription}|||||{productName}";
        }
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
        public Dictionary<ApplicationInfo, List<TimeRange>> screenTimeData;
    }

}
