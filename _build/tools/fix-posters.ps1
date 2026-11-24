$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$src = "C:\Users\khali\Desktop\..MKH\works-src"
$dst = "$src\posters"
New-Item -ItemType Directory -Path $dst -Force | Out-Null

function Get-Box($path) {
    $b = New-Object System.Drawing.Bitmap($path)
    $W = $b.Width; $H = $b.Height
    $step = 13
    function RowFlat($y) {
        $p0 = $b.GetPixel(1, $y)
        for ($x = 1; $x -lt $W; $x += $step) {
            $c = $b.GetPixel($x, $y)
            if ([Math]::Abs($c.R - $p0.R) + [Math]::Abs($c.G - $p0.G) + [Math]::Abs($c.B - $p0.B) -gt 26) { return $false }
        }
        return $true
    }
    function ColFlat($x) {
        $p0 = $b.GetPixel($x, 1)
        for ($y = 1; $y -lt $H; $y += $step) {
            $c = $b.GetPixel($x, $y)
            if ([Math]::Abs($c.R - $p0.R) + [Math]::Abs($c.G - $p0.G) + [Math]::Abs($c.B - $p0.B) -gt 26) { return $false }
        }
        return $true
    }
    $top = 0;      while ($top -lt ($H - 2) -and (RowFlat $top)) { $top++ }
    $bot = $H - 1; while ($bot -gt 1 -and (RowFlat $bot)) { $bot-- }
    $left = 0;      while ($left -lt ($W - 2) -and (ColFlat $left)) { $left++ }
    $right = $W - 1; while ($right -gt 1 -and (ColFlat $right)) { $right-- }
    $c00 = $b.GetPixel(1, 1)
    "  size=${W}x${H} pad=#$(('{0:X2}{1:X2}{2:X2}' -f $c00.R,$c00.G,$c00.B)) box=x${left}..${right} y${top}..${bot} => $(($right-$left+1))x$(($bot-$top+1))"
    $result = @{ L = $left; T = $top; W = ($right - $left + 1); H = ($bot - $top + 1) }
    $b.Dispose()
    return $result
}

function Crop-Write($path, $name) {
    $box = Get-Box $path
    $src2 = New-Object System.Drawing.Bitmap($path)
    $rect = New-Object System.Drawing.Rectangle $box.L, $box.T, $box.W, $box.H
    $crop = $src2.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $src2.Dispose()
    $tmp = "$env:TEMP\mkh_poster_tmp.jpg"
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $ps = New-Object System.Drawing.Imaging.EncoderParameters 1
    $ps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 90)
    $crop.Save($tmp, $enc, $ps)
    $crop.Dispose()
    "  cropped -> $dst\$name.jpg"
    Copy-Item $tmp "$dst\$name.jpg" -Force
}

"poster-1 (video editing):"
Crop-Write "$src\poster-1.png" "video-editing-poster"
"poster-2 (pptx game):"
Crop-Write "$src\poster-2.png" "pptx-game-poster"
Get-ChildItem $dst | Select-Object Name, Length
