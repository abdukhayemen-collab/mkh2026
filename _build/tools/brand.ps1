$ErrorActionPreference = "Stop"
. "$PSScriptRoot\image-util.ps1"

$root = "C:\Users\khali\Desktop\..MKH"
$brand = "$root\assets\brand"
New-Item -ItemType Directory -Path $brand -Force | Out-Null

# 1. untouched copy of the original logo (kept byte-for-byte)
Copy-Item "$root\LOGO.png" "$brand\logo-original.png" -Force

# 2. transparent knockout of the whole logo
Remove-LightBackground -InPath "$root\LOGO.png" -OutPath "$brand\logo-knock.png"

# 3. compact mark = upper portion (chevron + MKH wordmark), background removed
$src = New-Object System.Drawing.Bitmap("$root\LOGO.png")
"source: $($src.Width)x$($src.Height)"
$src.Dispose()
