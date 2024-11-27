namespace cs_webserver
{
    public class AppLogger
    {
        private readonly string _realFilePath;

        public AppLogger(string filename, string APPDATA_NAME)
        {
            _realFilePath = Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), APPDATA_NAME), filename);
        }

        public void Log(string message)
        {
            
            Console.WriteLine(message);
            string timestamp = DateTime.Now.ToString("M/d/yyyy HH:mm");
            string logMessage = $"[{timestamp}] {message}";

            File.AppendAllText(_realFilePath, logMessage + "\n");
        }
    }
}
