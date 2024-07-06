using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Windows;
using System.Windows.Media.Animation;

namespace screentime;

public partial class MainWindow : Window
{
    private Dictionary<string, Dictionary<DateTime, DateTime>> AppDict = new();
    private WindowDetect WindowDetect = new();
    private readonly WindowDetectWorker worker = new();

    // read from file if exists
    // check time - if same time then:
    // deserialize json into dictionary
    // else append content of current.json into history.json

    // run history.json check 
    // checks for following
    // 2 json values in same day - merge
    // json days out of order - reorder 

    public MainWindow()
    {
        // AppDict = PreAppWorker.GetScreenTimeSave();
        InitializeComponent();
        // worker.Worker();
        
        Dictionary<String, TimeSpan> screenTime = Calculate_ScreenTime();
        foreach (var timeSpent in screenTime)
        {
            TimeSpan svar = timeSpent.Value;
            Console.WriteLine(timeSpent.Key + " : " + svar.Hours + " hours " + svar.Minutes + " minutes " + svar.Seconds + " seconds");
            Console.WriteLine(ConvertToMinutes(svar));
        }
        
        KeyValuePair<double[], string[]> kvp = GenerateAppUsageBarGraph();
        double[] values = kvp.Key;
        string[] labels = kvp.Value;
        Show_Chart(values, labels);
    }
    
    
    public KeyValuePair<double[], string[]> GenerateAppUsageBarGraph()
    {
        List<double> timeSpent = new List<double>();
        List<string> apps = new List<string>();
        Dictionary<String, TimeSpan> screenTime = Calculate_ScreenTime();
        foreach (var ts in screenTime)
        {
            TimeSpan svar = ts.Value;
            Console.WriteLine(ts.Key + " : " + svar.Hours + " hours " + svar.Minutes + " minutes " + svar.Seconds + " seconds");
            double hoursSpent = ConvertToMinutes(svar);
            timeSpent.Add(hoursSpent);
            apps.Add(ts.Key);
        }
        KeyValuePair<double[], string[]> kvp = new KeyValuePair<double[], string[]>(timeSpent.ToArray(), apps.ToArray());
        return kvp;
    }
    

    public double ConvertToMinutes(TimeSpan ts)
    {
        return ts.Hours + (ts.Minutes / 60.0);
    }
    private Dictionary<String, TimeSpan> Calculate_ScreenTime()
    {
        Dictionary<String, TimeSpan> screenTime = new Dictionary<String, TimeSpan>();
        TimeStruct rawData = PreAppUtils.ParseCurrentJson();
        foreach (KeyValuePair<String, Dictionary<DateTime, DateTime>> appData in rawData.Apps)
        {
            String appName = appData.Key;
            TimeSpan appScreenTime = new TimeSpan();
            Console.WriteLine(appName);
            foreach (KeyValuePair<DateTime, DateTime> appDetails in appData.Value)
            {
                var timespent = appDetails.Value - appDetails.Key;
                appScreenTime += timespent;
                Console.WriteLine(timespent);
            }

            screenTime.Add(appName, appScreenTime);
            Console.WriteLine("FINAL SCORE IS: " + appScreenTime.Seconds);
        }

        return screenTime;
    }

    private async void Button_Click(object sender, RoutedEventArgs e)
    {
        Console.WriteLine("Button pressed");
    }

    private void Show_Chart(double[] values, string[] labels)
    {
        Console.WriteLine("example chart shown");
        chartWpf.Plot.AddBar(values);
        chartWpf.Plot.XTicks(labels);
        chartWpf.Plot.SetAxisLimits(yMin: 0);
        chartWpf.Refresh();
    }
}