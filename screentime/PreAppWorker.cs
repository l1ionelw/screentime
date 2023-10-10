using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.Json;

namespace screentime
{
    internal class PreAppWorker
    {
        /* returns a timestruct, and attempts to read a backup from current.json file incase there was a crash. */
        public static TimeStruct GetScreenTimeSave()
        {
            // build basic time structure
            TimeStruct timeStruct = PreAppUtils.BuildBasicTimeStruct();

            // serialize backup timestruct from current.json
            TimeStruct backup = PreAppUtils.ParseCurrentJson();
            // if returned empty json, file is empty 
            if (backup.Day == null)
            {
                Console.WriteLine("nothing in backup, returning no timestruct");
                return timeStruct;
            }

            // backup date isn't the same, then update history json & zero out current.json
            if (PreAppUtils.IsTimeDiff(backup))
            {
                PreAppUtils.UpdateHistoryJson(backup);
                File.WriteAllText("current.json", string.Empty);
            }
            else
            {
                timeStruct = backup;
            }

            return timeStruct;
        }
    }

    public static class PreAppUtils
    {
        // API'S FOR CURRENT.JSON
        /* [DON'T USE] Parses current.json file for apps - returns datetime nested dictionary */
        public static Dictionary<String, Dictionary<DateTime, DateTime>> ParseCurrentJsonApps()
        {
            Dictionary<String, Dictionary<DateTime, DateTime>> AppDict =
                new Dictionary<string, Dictionary<DateTime, DateTime>>();
            if (!CheckFileExists("current.json"))
            {
                return AppDict;
            }

            // parse json
            TimeStruct CurrentJsonBackup = ParseCurrentJson(); // returns empty timestruct if failed
            // check if function failed
            if (CurrentJsonBackup.Day == default)
            {
                AppDict = new Dictionary<string, Dictionary<DateTime, DateTime>>();
                return AppDict;
            }

            // check time diff
            if (IsTimeDiff(CurrentJsonBackup))
            {
                UpdateHistoryJson(CurrentJsonBackup);
                AppDict = new Dictionary<string, Dictionary<DateTime, DateTime>>();
            }

            return AppDict;
        }

        /* Reads history.json & parses is into a list of time structs */
        public static List<TimeStruct> GetHistory()
        {
            List<TimeStruct> HistoryList = new List<TimeStruct>();
            if (!CheckFileExists("history.json"))
            {
                return HistoryList;
            }

            string HistoryString = File.ReadAllText("history.json", Encoding.UTF8);
            try
            {
                HistoryList = JsonSerializer.Deserialize<List<TimeStruct>>(HistoryString);
            }
            catch (Exception e)
            {
                Console.WriteLine("History retrieval: JSON parse failed: " + e.Message);
                File.WriteAllText("history.json", string.Empty);
            }

            return HistoryList;
        }

        /* appends timeStructToAppend to history json, reads history.json, turns it into a list of timestructs, them appends the new timestruct & writes it back into the json */
        public static bool UpdateHistoryJson(TimeStruct timeStructToAppend)
        {
            List<TimeStruct> History = GetHistory();
            History.Add(timeStructToAppend);
            // write history list back into history.json
            var options = new JsonSerializerOptions();
            options.WriteIndented = true;
            string HistoryString = JsonSerializer.Serialize(History, options);
            File.WriteAllText("history.json", HistoryString);
            return true;
        }

        /* Check JSON time diff from current day */
        public static bool IsTimeDiff(TimeStruct timeStruct)
        {
            string TodayDateFormatted = DateTime.Now.ToString("MMddyyyy");
            string FileDateFormatted = timeStruct.Month + timeStruct.Day + timeStruct.Year;
            if (TodayDateFormatted != FileDateFormatted)
            {
                return true;
            }

            return false;
        }

        /* Parses current.json with error handling */
        public static TimeStruct ParseCurrentJson()
        {
            TimeStruct CurrentJsonBackup = new TimeStruct();
            if (!CheckFileExists("current.json"))
            {
                return CurrentJsonBackup;
            }

            string JsonText = File.ReadAllText("current.json", Encoding.UTF8);
            try
            {
                CurrentJsonBackup = JsonSerializer.Deserialize<TimeStruct>(JsonText);
            }
            catch (JsonException e)
            {
                Console.WriteLine("Json parse failed! Clearing current.json: " + e.Message);
                File.WriteAllText("current.json", string.Empty);
            }

            return CurrentJsonBackup;
        }

        /* checks if a file exists, if not, creates the file */
        public static bool CheckFileExists(string jsonFileName)
        {
            if (!File.Exists(jsonFileName))
            {
                CreateFile(jsonFileName);
                return false;
            }

            return true;
        }

        /* Create file w error handling */
        public static bool CreateFile(string fileName)
        {
            try
            {
                FileStream fs = File.Create(fileName);
            }
            catch (Exception e)
            {
                Console.WriteLine("Error creating file: " + e);
                return false;
            }

            return true;
        }

        /* initializes a basic TimeStruct object with current date & no apps */
        public static TimeStruct BuildBasicTimeStruct()
        {
            DateTime CurrentTime = DateTime.Now;
            Dictionary<String, Dictionary<DateTime, DateTime>> AppDict =
                new Dictionary<string, Dictionary<DateTime, DateTime>>();
            TimeStruct timeStruct = new TimeStruct
            {
                Month = CurrentTime.ToString("MM"),
                Day = CurrentTime.ToString("dd"),
                Year = CurrentTime.ToString("yyyy"),
                Apps = AppDict,
            };
            return timeStruct;
        }
    }
}