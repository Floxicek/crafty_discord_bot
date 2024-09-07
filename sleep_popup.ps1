$seconds_to_wait=120
$pop = New-Object -ComObject WScript.Shell
$pop.AppActivate("Turn off the computer")
$popupResult = $pop.Popup('Powering off the computer',$seconds_to_wait,'Turn off the computer',0)

if ($popupResult -eq 1) {
    Write-Host "User clicked Yes"
} else {
    Write-Host "User did not click"
    Stop-Computer -Force
}