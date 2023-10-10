using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace screentime
{
    public class TimeStruct
    {
        public string Month { get; set; }
        public string Day { get; set; }
        public string Year { get; set; }
        public Dictionary<String, Dictionary<DateTime, DateTime>> Apps { get; set; }
    }
}