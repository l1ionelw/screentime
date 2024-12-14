; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Screen Time"
#define MyAppVersion "0.0.1"
#define MyAppPublisher "l1ionelw"
#define MyAppExeName "screentime-development.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{594461C7-3C57-4D39-B35C-85383F5CCBB9}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\ScreenTime
DefaultGroupName=ScreenTime
DisableProgramGroupPage=yes
; Uncomment the following line to run in non administrative install mode (install for current user only.)
;PrivilegesRequired=lowest
OutputDir=C:\Users\yiche\screentime\v3\inno-setup\Output
OutputBaseFilename=screentime-setup
SetupIconFile=D:\PC-Files\Downloads\AppIcon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
LZMAUseSeparateProcess=yes
LZMANumBlockThreads=6
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\Users\yiche\screentime\v3\build\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs;
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\electron\screentime-development.exe"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\electron\screentime-development.exe"; Tasks: desktopicon

[Registry]
; Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "Screentime Webserver"; ValueData: """{app}\webserver\cs-webserver.exe"""; Flags: uninsdeletevalue
Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "Screentime Tray App"; ValueData: """{app}\trayapp\TrayApp.exe"" delayedStart"; Flags: uninsdeletevalue

[UninstallRun]
Filename: "taskkill"; Parameters: "/im ""cs-webserver.exe"" /f"; Flags: runhidden
Filename: "taskkill"; Parameters: "/im ""TrayApp.exe"" /f"; Flags: runhidden
Filename: "schtasks"; Parameters: "/Delete /TN ""Screentime Webserver"" /F"; Flags: runhidden
Filename: "schtasks"; Parameters: "/Delete /TN ""Screentime Window Change Manager"" /F"; Flags: runhidden

[Run]
Filename: "schtasks"; \
    Parameters: "/Create /F /SC ONLOGON /RL HIGHEST /RU SYSTEM /TN ""Screentime Webserver"" /TR ""'{app}\webserver\cs-webserver.exe'"""; \
    Flags: runhidden

Filename: "schtasks"; \
    Parameters: "/run /tn ""Screentime Webserver"""; \
    Flags: runhidden
    
Filename: "{app}\trayapp\TrayApp.exe"; Flags: nowait
