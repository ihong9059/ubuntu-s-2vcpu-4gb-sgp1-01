# Delete existing v3 rule and recreate with netsh
netsh advfirewall firewall delete rule name="SAM AI v3" 2>$null
netsh advfirewall firewall add rule name="SAM AI v3" dir=in action=allow protocol=TCP localport=5060 profile=any
Write-Host "SAM AI v3 firewall rule recreated via netsh"

# Also add program-based rule for Python
netsh advfirewall firewall delete rule name="Python 3.11 Allow" 2>$null
netsh advfirewall firewall add rule name="Python 3.11 Allow" dir=in action=allow program="C:\Python311\python.exe" profile=any
Write-Host "Python 3.11 program rule added"

# Show results
netsh advfirewall firewall show rule name="SAM AI v3"
netsh advfirewall firewall show rule name="Python 3.11 Allow"

Start-Sleep -Seconds 3
