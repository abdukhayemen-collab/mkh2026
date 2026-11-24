$ErrorActionPreference = "Stop"
. "$PSScriptRoot\image-util.ps1"

$root = "C:\Users\khali\Desktop\..MKH"
$src = "$root\works-src"
$works = "$root\assets\works"
$brand = "$root\assets\brand"
$docs = "$root\assets\docs"
$video = "$root\assets\video"
foreach ($d in @($works, $brand, $docs, $video, "$root\assets\fonts", "$root\assets\css", "$root\assets\js")) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}

# ------------------------------------------------------------------ brand crops
$logoSrc = New-Object System.Drawing.Bitmap("$root\LOGO.png")
$W = $logoSrc.Width; $H = $logoSrc.Height
# bounding box of the dark MKH wordmark inside the lower half of the logo
$minX = $W; $maxX = 0; $minY = $H; $maxY = 0
for ($y = 250; $y -lt 478; $y++) {
    for ($x = 20; $x -lt ($W - 20); $x++) {
        $c = $logoSrc.GetPixel($x, $y)
        $mx = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
        if ($mx -lt 120) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
$logoSrc.Dispose()
"MKH wordmark bbox: x $minX..$maxX  y $minY..$maxY"

$pad = 10
$mx0 = [Math]::Max(0, $minX - $pad); $my0 = [Math]::Max(0, $minY - $pad)
$mw = [Math]::Min($W - $mx0, ($maxX - $minX + 1 + 2 * $pad)); $mh = [Math]::Min($H - $my0, ($maxY - $minY + 1 + 2 * $pad))

Crop-And-Resize -InPath "$brand\logo-knock.png" -OutPath "$brand\mark-mkh.png" -X $mx0 -Y $my0 -W $mw -H $mh -KeepPng -MaxWidth 900
Crop-And-Resize -InPath "$brand\logo-knock.png" -OutPath "$brand\mark-lockup.png" -X 8 -Y 8 -W ($W - 16) -H 470 -KeepPng -MaxWidth 900

# logo showcase boards
Compose-OnColor -InPath "$brand\logo-original.png" -OutPath "$works\logo-mkh-light.jpg" -Color "#FBFAF7" -PadPercent 8 -OutWidth 1400
Compose-OnColor -InPath "$brand\logo-knock.png" -OutPath "$works\logo-mkh-dark.jpg" -Color "#12212F" -PadPercent 8 -OutWidth 1400
Compose-OnColor -InPath "$brand\logo-knock.png" -OutPath "$works\logo-mkh-gold.jpg" -Color "#F5AD1B" -PadPercent 8 -OutWidth 1400

# --------------------------------------------------------------- imagery pairs
function Publish-Pair {
    param([string]$In, [string]$Name, [int]$Full = 1700, [int]$Thumb = 900, [switch]$KeepPng, [double]$Ratio = 0)
    $srcBmp = New-Object System.Drawing.Bitmap($In)
    $sw = $srcBmp.Width; $sh = $srcBmp.Height; $srcBmp.Dispose()
    $tmp = $In
    if ($Ratio -gt 0) {
        $targetH = [int]($sw / $Ratio)
        if ($targetH -lt $sh) {
            $cropY = [int](($sh - $targetH) / 2)
            $tmp = "$env:TEMP\mkh_ratio_$Name.png"
            Crop-And-Resize -InPath $In -OutPath $tmp -X 0 -Y $cropY -W $sw -H $targetH -MaxWidth $sw -KeepPng
        }
    }
    if ($KeepPng) {
        Resize-Image -InPath $tmp -OutPath "$works\$Name.png" -MaxWidth $Full -KeepPng
        Resize-Image -InPath $tmp -OutPath "$works\thumbs\$Name.png" -MaxWidth $Thumb -KeepPng
    }
    else {
        Resize-Image -InPath $tmp -OutPath "$works\$Name.jpg" -MaxWidth $Full -Quality 88
        Resize-Image -InPath $tmp -OutPath "$works\thumbs\$Name.jpg" -MaxWidth $Thumb -Quality 84
    }
    if ($tmp -ne $In) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
}
New-Item -ItemType Directory -Path "$works\thumbs" -Force | Out-Null

# نموذج السيرة الذاتية يصل على لوحة أطول قليلًا مع شريط شفاف في الأسفل:
# نقصّه ونسطّحه على خلفية بيضاء حتى لا يظهر خط داكن في ملف JPG.
function Publish-CvPair {
    param([string]$In, [string]$Name, [int]$Full = 1700, [int]$Thumb = 900)
    $b = New-Object System.Drawing.Bitmap($In)
    $w = $b.Width; $h = $b.Height
    while ($h -gt 1) {
        $empty = $true
        for ($x = 0; $x -lt $w; $x += 4) { if ($b.GetPixel($x, $h - 1).A -gt 8) { $empty = $false; break } }
        if (-not $empty) { break }
        $h--
    }
    $flat = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($flat)
    $g.Clear([System.Drawing.Color]::White)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $g.DrawImage($b, $rect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose(); $b.Dispose()
    $tmp = "$env:TEMP\mkh_cv_flat.png"
    $flat.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
    $flat.Dispose()
    Resize-Image -InPath $tmp -OutPath "$works\$Name.jpg" -MaxWidth $Full -Quality 88
    Resize-Image -InPath $tmp -OutPath "$works\thumbs\$Name.jpg" -MaxWidth $Thumb -Quality 84
    Remove-Item $tmp -Force
}

# original design files supplied by the store
$allPng = Get-ChildItem -LiteralPath $root -File -Filter '*.png' | Where-Object { $_.Name -ne 'LOGO.png' }
$fAd = ($allPng | Where-Object { $_.Name -like '*إعلان*' } | Select-Object -First 1).FullName
$fBrochure = ($allPng | Where-Object { $_.Name -like '*مطوية*' } | Select-Object -First 1).FullName
$fCvOld = ($allPng | Where-Object { $_.Name -like '*سيرة*' } | Select-Object -First 1).FullName
$fCv = ($allPng | Where-Object { $_.Name -like '*سي في*' } | Select-Object -First 1).FullName
$fCard = ($allPng | Where-Object { $_.Name -like '*كرت*' } | Select-Object -First 1).FullName
"source designs:"; $fAd, $fBrochure, $fCvOld, $fCv, $fCard | ForEach-Object { "  $_" }

Publish-Pair -In $fAd -Name "ad-school-invitation"
Publish-Pair -In $fBrochure -Name "brochure-mindmap"
# النموذج المعروض حاليًا في الموقع
Publish-CvPair -In $fCv -Name "cv-design-2"
# النموذج السابق — محفوظ في المشروع ولا يُستخدم في الموقع
Publish-Pair -In $fCvOld -Name "cv-design"
Publish-Pair -In $fCard -Name "invitation-card"

# rendered presentation slides (real PowerPoint / PDF page renders)
1..9 | ForEach-Object { Publish-Pair -In "$src\deck-$_.png" -Name "deck-slide-$_" -Full 1600 -Thumb 800 }
1..4 | ForEach-Object { Publish-Pair -In "$src\static-slides-p$_.png" -Name "static-slide-$_" -Full 1700 -Thumb 850 }
1..3 | ForEach-Object { Publish-Pair -In "$src\research-paper-p$_.png" -Name "research-page-$_" -Full 1500 -Thumb 750 }

# video posters (already cropped to the true video aspect)
Publish-Pair -In "$src\posters\video-editing-poster.jpg" -Name "video-editing-poster" -Full 1000 -Thumb 700
Publish-Pair -In "$src\posters\pptx-game-poster.jpg" -Name "pptx-game-poster" -Full 1600 -Thumb 900

# real hero artwork taken from the two live websites
Publish-Pair -In "$src\site-palestine-cover.jpg" -Name "site-palestine-cover" -Full 1700 -Thumb 900
Publish-Pair -In "$src\site-yemen-cover.jpg" -Name "site-yemen-cover" -Full 1700 -Thumb 900

# ------------------------------------------------------------------ web copies
Copy-Item -LiteralPath (Get-ChildItem -LiteralPath $root -File -Filter '*.pptx' | Select-Object -First 1).FullName "$docs\animated-presentation.pptx" -Force
Copy-Item -LiteralPath (Get-ChildItem -LiteralPath $root -File -Filter '*.pdf' | Where-Object { $_.Name -like '*عروض*' } | Select-Object -First 1).FullName "$docs\static-presentations.pdf" -Force
Copy-Item -LiteralPath (Get-ChildItem -LiteralPath $root -File -Filter '*.pdf' | Where-Object { $_.Name -like '*بحث*' } | Select-Object -First 1).FullName "$docs\research-paper.pdf" -Force
$vids = Get-ChildItem -LiteralPath $root -File -Filter '*.mp4' | Sort-Object Name
Copy-Item -LiteralPath $vids[0].FullName "$video\video-editing-sample.mp4" -Force
Copy-Item -LiteralPath $vids[1].FullName "$video\pptx-game-sample.mp4" -Force

"--- assets/works ---"
Get-ChildItem "$works" -File | Sort-Object Name | ForEach-Object { "{0,-34} {1,7} KB" -f $_.Name, [Math]::Round($_.Length / 1KB) }
"--- assets/works/thumbs ---"
(Get-ChildItem "$works\thumbs" -File | Measure-Object).Count
"--- docs/video ---"
Get-ChildItem $docs, $video -File | ForEach-Object { "{0,-34} {1,7} KB" -f $_.Name, [Math]::Round($_.Length / 1KB) }
