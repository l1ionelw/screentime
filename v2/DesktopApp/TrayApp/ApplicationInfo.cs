using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TrayApp
{
    struct ApplicationInfo
    {
        public string path;
        public string fileDescription;
        public string productName;
    }
    struct TimeRange
    {
        public long startTime;
        public long endTime;
    }
    struct ApplicationHistory
    {
        public ApplicationInfo appInfo;
        public TimeRange[] timeRange;
    }
}
