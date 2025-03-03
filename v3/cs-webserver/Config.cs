public class Config
    {
        public TrayApp trayapp { get; set; } = new TrayApp();
    }

    public class TrayAppConfig
    {
        public bool showwindow { get; set; } = true; // Default value
    }