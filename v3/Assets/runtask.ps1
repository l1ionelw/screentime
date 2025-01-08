$executableFilePath = $args[0]
$taskname = "1Screentime Webserver"
$taskdescription = "meow meow meow meow"
$action = New-ScheduledTaskAction -Execute $executableFilePath
$trigger = New-ScheduledTaskTrigger -AtLogon
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName $taskname -Description $taskdescription -User "System" -Settings $settings
