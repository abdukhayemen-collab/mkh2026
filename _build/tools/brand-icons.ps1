$ErrorActionPreference = "Stop"
. "$PSScriptRoot\image-util.ps1"
$root = "C:\Users\khali\Desktop\..MKH"
$brand = "$root\assets\brand"

# ---------- gold-only "K" extracted from the original wordmark ----------
$src = New-Object System.Drawing.Bitmap("$brand\logo-knock.png")
$x0 = 240; $y0 = 268; $w = 200; $h = 196
$gold = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $src.GetPixel($x0 + $x, $y0 + $y)
        $isGold = ($c.R -gt 110 -and ($c.R - $c.B) -gt 55)
        if ($isGold) {
            $gold.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
        }
    }
}
$src.Dispose()
$goldTmp = "$env:TEMP\mkh_gold_k.png"
$gold.Save($goldTmp, [System.Drawing.Imaging.ImageFormat]::Png)
$gold.Dispose()

Compose-OnColor -InPath $goldTmp -OutPath "$brand\icon-plate.jpg" -Color "#12212F" -PadPercent 16 -OutWidth 512 -Quality 94
Copy-Item "$brand\icon-plate.jpg" "$root\assets\icon-512.jpg" -Force
Compose-OnColor -InPath $goldTmp -OutPath "$root\assets\icon-180.png" -Color "#12212F" -PadPercent 16 -OutWidth 180 -Quality 94
Compose-OnColor -InPath $goldTmp -OutPath "$root\favicon-32.png" -Color "#12212F" -PadPercent 14 -OutWidth 32 -Quality 94
Remove-Item "$brand\icon-180.png", "$brand\icon-square-512.jpg", "$root\assets\icon-512.png" -Force -ErrorAction SilentlyContinue

# ---------- social share image: original logo on an ivory plate ----------
$og = New-Object System.Drawing.Bitmap(1200, 630, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 0, 0), (New-Object System.Drawing.Point 1200, 630),
    [System.Drawing.ColorTranslator]::FromHtml("#0A1521"), [System.Drawing.ColorTranslator]::FromHtml("#1C3752"))
$g.FillRectangle($bg, 0, 0, 1200, 630)
$penNavy = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#2A4563")), 12
$penNavy.StartCap = [System.Drawing.Drawing2D.LineCap]::Round; $penNavy.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLines($penNavy, @((New-Object System.Drawing.Point -60, 70), (New-Object System.Drawing.Point 150, 245), (New-Object System.Drawing.Point 380, 40)))
$g.DrawLines($penNavy, @((New-Object System.Drawing.Point 880, 30), (New-Object System.Drawing.Point 1090, 200), (New-Object System.Drawing.Point 1290, 60)))
$penGold = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#F5AD1B")), 12
$penGold.StartCap = [System.Drawing.Drawing2D.LineCap]::Round; $penGold.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLines($penGold, @((New-Object System.Drawing.Point 960, 630), (New-Object System.Drawing.Point 1120, 495), (New-Object System.Drawing.Point 1290, 600)))

# ivory plate with the untouched original logo
$logoIm = [System.Drawing.Image]::FromFile("$brand\logo-original.png")
$lw = 250; $lh = [int]($logoIm.Height * $lw / $logoIm.Width)
$px = 600 - $lw; $py = 56
$pad = 16
$plate = New-Object System.Drawing.Rectangle (($px - $pad), ($py - $pad), ($lw + 2 * $pad), ($lh + 2 * $pad))
$g.FillRectangle([System.Drawing.Brushes]::White, $plate)
$g.DrawRectangle((New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#F5AD1B")), 2), $plate)
$g.DrawImage($logoIm, $px, $py, $lw, $lh)
$logoIm.Dispose()

$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$brushGold = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#F5AD1B"))
$brushSoft = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#C9D7E4"))
$f1 = New-Object System.Drawing.Font("Almarai", 46, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$f2 = New-Object System.Drawing.Font("Tajawal", 27, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$f3 = New-Object System.Drawing.Font("Reem Kufi", 19, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString("التصميم معنا... له فن ومعنى", $f1, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF 0, 388, 1200, 70), $sf)
$g.DrawString("لا مبالغة ولا احتيال.. أسعارنا ولا بالخيال", $f2, $brushGold, (New-Object System.Drawing.RectangleF 0, 470, 1200, 50), $sf)
$g.DrawString("MKH  ·  تصميم وخدمات رقمية وتعليمية", $f3, $brushSoft, (New-Object System.Drawing.RectangleF 0, 530, 1200, 40), $sf)
$g.Dispose()
$og.Save("$root\assets\og-image.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$og.Dispose()

"done"
Get-ChildItem "$brand", "$root\assets" -File | Where-Object { $_.Extension -in '.png', '.jpg' } | Select-Object Name, @{n = 'KB'; e = { [Math]::Round($_.Length / 1KB) } } | Format-Table -AutoSize | Out-String -Width 200
