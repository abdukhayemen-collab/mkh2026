$ErrorActionPreference = "Stop"
. "$PSScriptRoot\image-util.ps1"
$root = "C:\Users\khali\Desktop\..MKH"
$brand = "$root\assets\brand"
$goldTmp = "$env:TEMP\mkh_gold_k.png"
if (-not (Test-Path $goldTmp)) { throw "missing $goldTmp" }
Compose-OnColor -InPath $goldTmp -OutPath "$brand\icon-plate.jpg" -Color "#12212F" -PadPercent 26 -OutWidth 512 -Quality 94
Copy-Item "$brand\icon-plate.jpg" "$root\assets\icon-512.jpg" -Force
Compose-OnColor -InPath $goldTmp -OutPath "$root\assets\icon-180.png" -Color "#12212F" -PadPercent 26 -OutWidth 180 -Quality 94
Compose-OnColor -InPath $goldTmp -OutPath "$root\favicon-32.png" -Color "#12212F" -PadPercent 22 -OutWidth 32 -Quality 94
"icons rebuilt"
