public class Config
{
    public TrayAppConfig trayapp { get; set; } = new TrayAppConfig();
}

public class TrayAppConfig
{
    public bool showwindow { get; set; } = true; // Default value
}