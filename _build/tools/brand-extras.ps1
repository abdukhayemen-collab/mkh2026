$ErrorActionPreference = "Stop"
. "$PSScriptRoot\image-util.ps1"
$root = "C:\Users\khali\Desktop\..MKH"
$brand = "$root\assets\brand"
$works = "$root\assets\works"

# ---- locate the gold "K" glyph inside the wordmark (high-saturation pixels) ----
$b = New-Object System.Drawing.Bitmap("$root\LOGO.png")
$minX = 99999; $maxX = 0; $minY = 99999; $maxY = 0
for ($y = 270; $y -lt 460; $y++) {
    for ($x = 100; $x -lt 560; $x++) {
        $c = $b.GetPixel($x, $y)
        $mx = [Math]::Max($c.R, [Math]::Max($c.G, $c.B)); $mn = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
        if (($mx - $mn) -gt 70 -and $c.R -gt 150) {
            if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
$b.Dispose()
"gold K bbox: x $minX..$maxX  y $minY..$maxY"

# square crop centred on the K
$kPad = 14
$kx0 = [Math]::Max(0, $minX - $kPad); $ky0 = [Math]::Max(0, $minY - $kPad)
$kx1 = [Math]::Min(639, $maxX + $kPad); $ky1 = [Math]::Min(637, $maxY + $kPad)
$kw = $kx1 - $kx0 + 1; $kh = $ky1 - $ky0 + 1
$side = [Math]::Max($kw, $kh)
$kcx = [int](($kx0 + $kx1) / 2); $kcy = [int](($ky0 + $ky1) / 2)
$kx = [Math]::Max(0, [Math]::Min(640 - $side, $kcx - [int]($side / 2)))
$ky = [Math]::Max(0, [Math]::Min(638 - $side, $kcy - [int]($side / 2)))
"K square crop: $kx,$ky ${side}x${side}"
Crop-And-Resize -InPath "$brand\logo-knock.png" -OutPath "$brand\glyph-k.png" -X $kx -Y $ky -W $side -H $side -KeepPng -MaxWidth 512

# ---- favicon / app icons: gold K on a navy tile ----
Compose-OnColor -InPath "$brand\glyph-k.png" -OutPath "$brand\icon-180.png" -Color "#12212F" -PadPercent 26 -OutWidth 180 -Quality 92
Copy-Item "$brand\icon-180.png" "$root\assets\icon-180.png" -Force
Compose-OnColor -InPath "$brand\glyph-k.png" -OutPath "$root\assets\icon-512.png" -Color "#12212F" -PadPercent 26 -OutWidth 512 -Quality 92
Compose-OnColor -InPath "$brand\glyph-k.png" -OutPath "$root\favicon-32.png" -Color "#12212F" -PadPercent 26 -OutWidth 32 -Quality 92
# a transparent-PNG flavicon too
Compose-OnColor -InPath "$brand\glyph-k.png" -OutPath "$brand\icon-square-512.jpg" -Color "#12212F" -PadPercent 24 -OutWidth 512 -Quality 92

# ---- logo board thumbnails ----
foreach ($n in @('logo-mkh-light', 'logo-mkh-dark', 'logo-mkh-gold')) {
    Resize-Image -InPath "$works\$n.jpg" -OutPath "$works\thumbs\$n.jpg" -MaxWidth 800 -Quality 84
}

# ---- social share image (1200x630) ----
$og = New-Object System.Drawing.Bitmap(1200, 630, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 0, 0), (New-Object System.Drawing.Point 1200, 630),
    [System.Drawing.ColorTranslator]::FromHtml("#0C1A28"), [System.Drawing.ColorTranslator]::FromHtml("#1B3450"))
$g.FillRectangle($brushBg, 0, 0, 1200, 630)
# gold chevron accents echoing the logo ribbon
$penGold = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#F5AD1B")), 10
$penGold.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penGold.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$penNavy = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#28405C")), 10
$penNavy.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penNavy.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLines($penNavy, @((New-Object System.Drawing.Point -40, 90), (New-Object System.Drawing.Point 180, 250), (New-Object System.Drawing.Point 420, 60)))
$g.DrawLines($penNavy, @((New-Object System.Drawing.Point 900, 40), (New-Object System.Drawing.Point 1120, 200), (New-Object System.Drawing.Point 1260, 90)))
$g.DrawLines($penGold, @((New-Object System.Drawing.Point 1000, 630), (New-Object System.Drawing.Point 1160, 500), (New-Object System.Drawing.Point 1260, 570)))
$logoIm = [System.Drawing.Image]::FromFile("$brand\logo-knock.png")
$lw = 300; $lh = [int]($logoIm.Height * $lw / $logoIm.Width)
$g.DrawImage($logoIm, [int]((1200 - $lw) / 2), 90, $lw, $lh)
$logoIm.Dispose()
$f1 = New-Object System.Drawing.Font("Almarai", 44, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$f2 = New-Object System.Drawing.Font("Almarai", 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$rect = New-Object System.Drawing.RectangleF 0, 410, 1200, 80
$g.DrawString("التصميم معنا... له فن ومعنى", $f1, [System.Drawing.Brushes]::White, $rect, $sf)
$rect2 = New-Object System.Drawing.RectangleF 0, 500, 1200, 60
$g.DrawString("لا مبالغة ولا احتيال.. أسعارنا ولا بالخيال", $f2, (New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#F5AD1B"))), $rect2, $sf)
$g.Dispose()
$og.Save("$root\assets\og-image.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$og.Dispose()

Get-ChildItem "$brand", "$root\assets" -File | Where-Object { $_.Extension -in '.png', '.jpg' } | Select-Object FullName, @{n = 'KB'; e = { [Math]::Round($_.Length / 1KB) } } | Format-Table -AutoSize | Out-String -Width 200
