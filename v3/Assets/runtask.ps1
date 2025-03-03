$executableFilePath = $args[0]
$taskname = "Screentime Webserver"
$taskdescription = "runs screentime's webserver"
$action = New-ScheduledTaskAction -Execute $executableFilePath
$trigger = New-ScheduledTaskTrigger -AtLogon
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName $taskname -Description $taskdescription -User "System" -Settings $settings
