$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$src = "C:\Users\khali\Desktop\..MKH\works-src"
$files = Get-ChildItem -Path $src -File -Recurse |
Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg' -and $_.Name -notlike '_*' } | Sort-Object Name
if ($env:MKH_SHEET_LIST) { $files = $files | Where-Object { $env:MKH_SHEET_LIST -split ',' -contains $_.BaseName } }

$cols = 4
$cellW = 380; $cellH = 300
$rows = [Math]::Ceiling($files.Count / $cols)
$sheet = New-Object System.Drawing.Bitmap(($cols * $cellW), ($rows * ($cellH + 22)), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::FromArgb(20, 26, 36))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$font = New-Object System.Drawing.Font("Consolas", 11)
$brush = [System.Drawing.Brushes]::White
$i = 0
foreach ($f in $files) {
    $col = $i % $cols; $row = [Math]::Floor($i / $cols)
    $x = $col * $cellW; $y = $row * ($cellH + 22)
    $im = [System.Drawing.Image]::FromFile($f.FullName)
    $scale = [Math]::Min(($cellW - 8) / $im.Width, $cellH / $im.Height)
    $w = [int]($im.Width * $scale); $h = [int]($im.Height * $scale)
    $g.DrawImage($im, ($x + ($cellW - $w) / 2), ($y + ($cellH - $h) / 2), $w, $h)
    $g.DrawString("$($i+1). $($f.BaseName) [$($im.Width)x$($im.Height)]", $font, $brush, $x + 6, ($y + $cellH + 3))
    $im.Dispose()
    $i++
}
$g.Dispose()
$out = "$env:TEMP\mkh-contact-sheet.jpg"
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ps = New-Object System.Drawing.Imaging.EncoderParameters 1
$ps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 88)
$sheet.Save($out, $enc, $ps)
$sheet.Dispose()
"$out  ($($files.Count) tiles)"
