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
    public struct JsonPostData
    {
        public string username;
        public long startTime;
        public long endTime;
        public string appPath;
        public ApplicationInfo appInfo;
    }
}
