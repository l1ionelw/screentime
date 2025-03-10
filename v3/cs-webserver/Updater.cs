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
        public void startPowershellUpdate(string exeFileName)
        {
            bool serverContactSuccess = false;
            string downloadDestination = Path.GetFullPath(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonDocuments), @"..")) + "\\ScreenTime\\" + exeFileName;
            string downloadUrl = UPDATER_SERVER_URL + "installer/" + exeFileName;
            // download the file
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
                    Debug.WriteLine("finished download!");
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
                Debug.WriteLine("starting powershell script in a seperate process");
                var programFilesUninstallFile = Path.GetFullPath(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "ScreenTime\\unins000.exe"));
                CreateHiddenDetachedProcess(programFilesUninstallFile, downloadDestination, true);
            } catch (Exception ex)
            {
                Console.WriteLine("Error in powershell update");
            }
        }
        static void CreateHiddenDetachedProcess(string uninstallExePath, string installExePath, bool debug)
        {
            Debug.WriteLine(uninstallExePath);
            Debug.WriteLine(installExePath);
            // Validate paths
            if (!File.Exists(uninstallExePath))
            {
                Debug.WriteLine("uninstall file not found", uninstallExePath);
                throw new FileNotFoundException("Uninstall executable not found", uninstallExePath);
            }

            if (!File.Exists(installExePath))
            {
                Debug.WriteLine("install file not found", installExePath);
                throw new FileNotFoundException("Install executable not found", installExePath);
            }

            // Create the batch file with installation commands using full paths
            string batchFilePath = Path.GetFullPath(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonDocuments), @"..")) + "\\ScreenTime\\update.bat";
            Debug.WriteLine(batchFilePath);
            var commandsToWrite = "";
            commandsToWrite += $"start /wait /b \"\" \"{installExePath}\" /silent  \n";
            Debug.WriteLine(commandsToWrite);
            try
            {
                File.WriteAllText(batchFilePath, commandsToWrite);
            } catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
            
            Debug.WriteLine("bat file finished writing to");

            // Create a process to run the batch file in a completely hidden way
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/c \"{batchFilePath}\"",  // /c means execute command and then terminate
                CreateNoWindow = !debug,
                WindowStyle = debug ? ProcessWindowStyle.Normal : ProcessWindowStyle.Hidden,
                UseShellExecute = false,
                RedirectStandardOutput = !debug,
                RedirectStandardError = !debug
            };

            // Start the process detached from the parent process
            Process process = new Process { StartInfo = startInfo };

            // Configure process to not be attached to parent console
            process.EnableRaisingEvents = true;

            // Start the hidden process
            Debug.WriteLine("cmd flow starting");
            process.Start();


            // Detach from the process to allow it to run independently
            Debug.WriteLine("detaching to run independent");
            process.Dispose();
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
                // Start the new process
                Process.Start(downloadDestination, "/silent");

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
