using System.Diagnostics;
using System.Security.Cryptography.X509Certificates;
using Newtonsoft.Json.Linq;
using Serilog;

namespace cs_webserver
{
    public class Updater
    {
        public static string CURRENT_VERSION = "1.0.0";
        private static string UPDATER_SERVER_URL = "http://localhost:3000/";
        public Updater()
        {
            Debug.WriteLine("CHECKING FOR UPDATES");

        }
        public void checkForUpdatesSync()
        {
            using (HttpClient client = new HttpClient() { Timeout = TimeSpan.FromSeconds(5) })
            {
                try
                {
                    // Send the GET request synchronously
                    HttpResponseMessage response = client.GetAsync(UPDATER_SERVER_URL).Result;

                    // Ensure the request was successful
                    response.EnsureSuccessStatusCode();

                    // Read the response content as a string synchronously
                    string responseBody = response.Content.ReadAsStringAsync().Result;

                    // Log the JSON output
                    Debug.WriteLine("Response JSON:");
                    Debug.WriteLine(responseBody);
                    var results = JToken.Parse(responseBody);
                    string latestVersion = results["latest"].ToString();
                    Debug.WriteLine(latestVersion);
                    if (latestVersion != CURRENT_VERSION)
                    {
                        Debug.WriteLine("needs update!");
                        update(results["installerName"].ToString());
                    }
                    
                }
                catch (AggregateException ae)
                {
                    // Handle errors
                    Debug.WriteLine("Error sending request:");
                    Debug.WriteLine(ae.InnerException?.Message ?? ae.Message);
                }
            }
        }
        public void update(string exeFileName)
        {
            bool serverContactSuccess = false;
            string downloadDestination = Path.GetFullPath(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonDocuments), @"..")) + "\\ScreenTime\\" + exeFileName;
            string downloadUrl = UPDATER_SERVER_URL + "installer/" + exeFileName;
            Debug.WriteLine("downloading new setup exe: " + downloadUrl);
            Debug.WriteLine("saving installer to: " + downloadDestination);

            using (var client = new HttpClient())
            {
                try
                {
                    using (var s = client.GetStreamAsync(downloadUrl))
                    {
                        using (var fs = new FileStream(downloadDestination, FileMode.OpenOrCreate))
                        {
                            s.Result.CopyTo(fs);
                        }
                    }
                    Debug.WriteLine("finsihed download!");
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("Error with download.");
                    Debug.WriteLine($"{ex.Message}");
                    return;
                }   
            }

            try
            {
                Debug.WriteLine("starting process");
                var programFilesUninstallFile = Path.GetFullPath(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "ScreenTime\\unins000.exe"));

                Debug.WriteLine(programFilesUninstallFile);
                // check if file exists
                if (File.Exists(programFilesUninstallFile))
                {
                    var uninstallProcess = Process.Start(programFilesUninstallFile, "");
                    uninstallProcess.WaitForExit();
                } else
                {
                    Debug.WriteLine("Uninstallation file doesn't exist");
                }
                
                // Start the new process
                Process.Start(downloadDestination, "");

                // Exit the current process
                Environment.Exit(0);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            }
        }
        public async Task checkforUpdates()
        {
            Log.Information("checking for updates");
            using (HttpClient client = new HttpClient())
            {
                try
                {
                    // Send the GET request
                    HttpResponseMessage response = await client.GetAsync(UPDATER_SERVER_URL);

                    // Ensure the request was successful
                    response.EnsureSuccessStatusCode();

                    // Read the response content as a string
                    string responseBody = await response.Content.ReadAsStringAsync();

                    // Log the JSON output
                    Debug.WriteLine("Response JSON:");
                    Debug.WriteLine(responseBody);
                }
                catch (HttpRequestException e)
                {
                    // Handle errors
                    Debug.WriteLine("Error sending request:");
                    Debug.WriteLine(e.Message);
                }
            }
        }
    }
}
