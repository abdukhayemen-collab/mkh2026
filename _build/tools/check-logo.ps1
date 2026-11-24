$ErrorActionPreference = "Stop"
. "$PSScriptRoot\image-util.ps1"
$b = "C:\Users\khali\Desktop\..MKH\assets\brand"
Compose-OnColor -InPath "$b\logo-knock.png" -OutPath "$env:TEMP\check-dark.jpg" -Color "#0B1622" -PadPercent 6 -OutWidth 900
Compose-OnColor -InPath "$b\logo-knock.png" -OutPath "$env:TEMP\check-light.jpg" -Color "#FFFFFF" -PadPercent 6 -OutWidth 900
Compose-OnColor -InPath "$b\logo-knock.png" -OutPath "$env:TEMP\check-gold.jpg" -Color "#F5AD1B" -PadPercent 6 -OutWidth 900
