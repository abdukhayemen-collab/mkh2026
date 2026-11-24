$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$src = "C:\Users\khali\Desktop\..MKH\works-src"

function Describe($p) {
    $b = New-Object System.Drawing.Bitmap($p)
    "--- $([System.IO.Path]::GetFileName($p))  $($b.Width)x$($b.Height)"
    foreach ($pt in @(@(0, 0), @($b.Width - 1, 0), @(0, $b.Height - 1), @($b.Width - 1, $b.Height - 1), @([int]($b.Width / 2), 5), @(5, [int]($b.Height / 2)), @($b.Width - 6, [int]($b.Height / 2)), @([int]($b.Width / 2), $b.Height - 6))) {
        $c = $b.GetPixel($pt[0], $pt[1])
        "   ($($pt[0]),$($pt[1])) #{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    }
    # row/column variance scan to find the letterbox
    function IsFlatRow($bmp, $y) {
        $first = $bmp.GetPixel(2, $y); $x = 2
        while ($x -lt $bmp.Width) {
            $c = $bmp.GetPixel($x, $y)
            if ([Math]::Abs($c.R - $first.R) + [Math]::Abs($c.G - $first.G) + [Math]::Abs($c.B - $first.B) -gt 24) { return $false }
            $x += 17
        }
        return $true
    }
    function IsFlatCol($bmp, $x) {
        $first = $bmp.GetPixel($x, 2); $y = 2
        while ($y -lt $bmp.Height) {
            $c = $bmp.GetPixel($x, $y)
            if ([Math]::Abs($c.R - $first.R) + [Math]::Abs($c.G - $first.G) + [Math]::Abs($c.B - $first.B) -gt 24) { return $false }
            $y += 17
        }
        return $true
    }
    $top = 0; while ($top -lt $b.Height - 1 -and (IsFlatRow $b $top)) { $top++ }
    $bot = $b.Height - 1; while ($bot -gt 0 -and (IsFlatRow $b $bot)) { $bot-- }
    $left = 0; while ($left -lt $b.Width - 1 -and (IsFlatCol $b $left)) { $left++ }
    $right = $b.Width - 1; while ($right -gt 0 -and (IsFlatCol $b $right)) { $right-- }
    "   content box: x=$left..$right  y=$top..$bot  => $($right-$left+1)x$($bot-$top+1)"
    $b.Dispose()
}

Describe "$src\poster-1.png"
Describe "$src\poster-2.png"
