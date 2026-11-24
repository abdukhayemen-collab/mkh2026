$ErrorActionPreference = "Stop"
. "$PSScriptRoot\image-util.ps1"
$src = "C:\Users\khali\Desktop\..MKH\works-src"
$works = "C:\Users\khali\Desktop\..MKH\assets\works"

function Crop-ToAspect {
    param([string]$In, [double]$AspectW, [double]$AspectH, [string]$OutName, [int]$Full, [int]$Thumb)
    $b = New-Object System.Drawing.Bitmap($In)
    $W = $b.Width; $H = $b.Height; $b.Dispose()
    $target = $AspectW / $AspectH
    $cur = $W / $H
    if ($cur -gt $target) {
        $cw = [int][Math]::Round($H * $target); $ch = $H; $cx = [int](($W - $cw) / 2); $cy = 0
    }
    else {
        $cw = $W; $ch = [int][Math]::Round($W / $target); $cx = 0; $cy = [int](($H - $ch) / 2)
    }
    "  $In  ${W}x${H} (ar $([Math]::Round($cur,3))) -> crop ${cw}x${ch} at ${cx},${cy} (ar $([Math]::Round($target,3)))"
    $tmp = "$env:TEMP\mkh_ar_tmp.png"
    Crop-And-Resize -InPath $In -OutPath $tmp -X $cx -Y $cy -W $cw -H $ch -MaxWidth $cw -KeepPng | Out-Null
    Resize-Image -InPath $tmp -OutPath "$works\$OutName.jpg" -MaxWidth $Full -Quality 88
    Resize-Image -InPath $tmp -OutPath "$works\thumbs\$OutName.jpg" -MaxWidth $Thumb -Quality 84
    Remove-Item $tmp -Force
}

Crop-ToAspect -In "$src\poster-1.png" -AspectW 512 -AspectH 768 -OutName "video-editing-poster" -Full 760 -Thumb 560
Crop-ToAspect -In "$src\poster-2.png" -AspectW 1908 -AspectH 1080 -OutName "pptx-game-poster" -Full 1600 -Thumb 900
