$isAdmin = ($null -ne (whoami /groups /fo csv |
        ConvertFrom-Csv |
        Where-Object { $_.SID -eq "S-1-5-32-544" }))
if ($isAdmin) {
    Write-Output "Is Administrator group";
}
else {
    Write-Output "Is not administrator group";
}