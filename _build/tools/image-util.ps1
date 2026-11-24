Add-Type -AssemblyName System.Drawing

function Get-BitmapBytes {
    param([System.Drawing.Bitmap]$Bmp)
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Bmp.Width, $Bmp.Height
    $data = $Bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $len = [Math]::Abs($data.Stride) * $Bmp.Height
    $buf = New-Object byte[] $len
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $len)
    $Bmp.UnlockBits($data)
    return @{ Buf = $buf; Stride = $data.Stride; Rect = $rect }
}

function Save-BitmapBytes {
    param([System.Drawing.Bitmap]$Bmp, [byte[]]$Buf)
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Bmp.Width, $Bmp.Height
    $data = $Bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    [System.Runtime.InteropServices.Marshal]::Copy($Buf, 0, $data.Scan0, $Buf.Length)
    $Bmp.UnlockBits($data)
}

# Removes a light, near-neutral background and returns a transparent ARGB bitmap.
function Remove-LightBackground {
    param(
        [string]$InPath,
        [string]$OutPath,
        [double]$SatThreshold = 42,      # saturation above this = definitely foreground
        [double]$DarkFull = 118,         # value at or below -> fully opaque
        [double]$DarkFade = 178,         # value at or above -> fully transparent
        [double]$SatFull = 60
    )
    $src = New-Object System.Drawing.Bitmap($InPath)
    $w = $src.Width; $h = $src.Height
    $d = Get-BitmapBytes $src
    $buf = $d.Buf; $stride = $d.Stride
    for ($y = 0; $y -lt $h; $y++) {
        $row = $y * $stride
        for ($x = 0; $x -lt $w; $x++) {
            $i = $row + ($x * 4)
            $b = $buf[$i]; $g = $buf[$i + 1]; $r = $buf[$i + 2]
            $max = [Math]::Max($r, [Math]::Max($g, $b))
            $min = [Math]::Min($r, [Math]::Min($g, $b))
            $sat = $max - $min
            $a = 0.0
            if ($sat -ge $SatThreshold) {
                # coloured pixel (brand gold / any accent) -> keep, ramp in softly
                $a = ($sat - $SatThreshold) / ($SatFull - $SatThreshold)
                if ($a -gt 1) { $a = 1 }
                if ($a -lt 0) { $a = 0 }
            }
            $va = ($DarkFade - $max) / ($DarkFade - $DarkFull)
            if ($va -gt 1) { $va = 1 }
            if ($va -lt 0) { $va = 0 }
            if ($va -gt $a) { $a = $va }
            $buf[$i + 3] = [byte][Math]::Round($a * 255)
        }
    }
    $out = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    Save-BitmapBytes $out $buf
    $src.Dispose()
    $out.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $out.Dispose()
    "$OutPath -> ${w}x${h}"
}

# High quality resize that writes JPG or PNG.
function Resize-Image {
    param(
        [string]$InPath,
        [string]$OutPath,
        [int]$MaxWidth = 1600,
        [int]$MaxHeight = 0,
        [int]$Quality = 82,
        [switch]$KeepPng,
        [switch]$Pad
    )
    $src = New-Object System.Drawing.Bitmap($InPath)
    $sw = $src.Width; $sh = $src.Height
    $scale = 1.0
    if ($MaxWidth -gt 0 -and $sw -gt $MaxWidth) { $scale = $MaxWidth / $sw }
    if ($MaxHeight -gt 0 -and $sh -gt $MaxHeight) { $scale = [Math]::Min($scale, ($MaxHeight / $sh)) }
    $nw = [int][Math]::Round($sw * $scale); $nh = [int][Math]::Round($sh * $scale)
    $dst = New-Object System.Drawing.Bitmap($nw, $nh, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dst)
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $nw, $nh)
    $g.Dispose()
    $src.Dispose()

    if ($KeepPng) {
        $dst.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } else {
        $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $ps = New-Object System.Drawing.Imaging.EncoderParameters 1
        $ps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int]$Quality)
        $dst.Save($OutPath, $enc, $ps)
    }
    $dst.Dispose()
    "$OutPath -> ${nw}x${nh}"
}

# Crops then resizes.
function Crop-And-Resize {
    param(
        [string]$InPath, [string]$OutPath,
        [int]$X, [int]$Y, [int]$W, [int]$H,
        [int]$MaxWidth = 1600, [int]$Quality = 84, [switch]$KeepPng
    )
    $src = New-Object System.Drawing.Bitmap($InPath)
    $rect = New-Object System.Drawing.Rectangle $X, $Y, $W, $H
    $crop = $src.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $src.Dispose()
    $tmp = [System.IO.Path]::Combine($env:TEMP, "mkh_crop_tmp.png")
    $crop.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
    Resize-Image -InPath $tmp -OutPath $OutPath -MaxWidth $MaxWidth -Quality $Quality -KeepPng:$KeepPng
    Remove-Item $tmp -Force
}

# Composites a transparent PNG onto a solid colour, with padding.
function Compose-OnColor {
    param(
        [string]$InPath, [string]$OutPath,
        [string]$Color = "#0E1B2A",
        [int]$PadPercent = 12,
        [int]$OutWidth = 1200,
        [int]$Quality = 88
    )
    $src = New-Object System.Drawing.Bitmap($InPath)
    $pad = [int]($OutWidth * $PadPercent / 100)
    $scale = ($OutWidth - 2 * $pad) / $src.Width
    $iw = [int]($src.Width * $scale); $ih = [int]($src.Height * $scale)
    $oh = $ih + 2 * $pad
    $dst = New-Object System.Drawing.Bitmap($OutWidth, $oh, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dst)
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml($Color))
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, $pad, $pad, $iw, $ih)
    $g.Dispose()
    $src.Dispose()
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $ps = New-Object System.Drawing.Imaging.EncoderParameters 1
    $ps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int]$Quality)
    $dst.Save($OutPath, $enc, $ps)
    $dst.Dispose()
    "$OutPath -> ${OutWidth}x${oh}"
}
