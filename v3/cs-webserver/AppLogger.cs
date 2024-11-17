namespace cs_webserver
{
    public class AppLogger
    {
        private readonly string _filename;

        public AppLogger(string filename)
        {
            _filename = filename;
        }

        public void Log(string message)
        {
            Console.WriteLine(message);
            string timestamp = DateTime.Now.ToString("M/d/yyyy HH:mm");
            string logMessage = $"[{timestamp}] {message}";

            File.AppendAllText(_filename, logMessage + "\n");
        }
    }
}
