$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$fontsDir = "C:\Users\khali\Desktop\..MKH\assets\fonts"
New-Item -ItemType Directory -Path $fontsDir -Force | Out-Null

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
$families = @(
    "family=Almarai:wght@400;700;800",
    "family=Tajawal:wght@400;500;700",
    "family=Reem+Kufi:wght@400;600"
)
$url = "https://fonts.googleapis.com/css2?$($families -join '&')&display=swap"
$css = (Invoke-WebRequest -Uri $url -UserAgent $ua -TimeoutSec 60).Content

$blocks = [regex]::Matches($css, '(?s)@font-face\s*\{(.*?)\}')
"found $($blocks.Count) font-face blocks"
$out = New-Object System.Text.StringBuilder
$n = 0
foreach ($b in $blocks) {
    $body = $b.Groups[1].Value
    $fam = [regex]::Match($body, "font-family:\s*'([^']+)'").Groups[1].Value
    $wght = [regex]::Match($body, 'font-weight:\s*([0-9 ]+)').Groups[1].Value.Trim()
    $rng = [regex]::Match($body, 'unicode-range:\s*([^;]+);').Groups[1].Value.Trim()
    $srcUrl = [regex]::Match($body, 'url\((https://[^)]+\.woff2)\)').Groups[1].Value
    if (-not $srcUrl) { continue }
    $slug = ($fam -replace '\s+', '') + "-" + ($wght -replace '\s+', '_')
    # label the subset from the unicode range
    $subset = "other"
    if ($rng -match 'U\+0600') { $subset = "arabic" }
    elseif ($rng -match 'U\+0100') { $subset = "latinext" }
    elseif ($rng -match 'U\+0000-00FF') { $subset = "latin" }
    $file = "$slug-$subset.woff2"
    $dest = Join-Path $fontsDir $file
    if (-not (Test-Path $dest)) {
        try { Invoke-WebRequest -Uri $srcUrl -OutFile $dest -UserAgent $ua -TimeoutSec 60 }
        catch { "  FAILED $srcUrl : $($_.Exception.Message)"; continue }
    }
    $N = "}"
    [void]$out.AppendLine("@font-face {")
    [void]$out.AppendLine("  font-family: '$fam';")
    [void]$out.AppendLine("  font-style: normal;")
    [void]$out.AppendLine("  font-weight: $wght;")
    [void]$out.AppendLine("  font-display: swap;")
    [void]$out.AppendLine("  src: url('../fonts/$file') format('woff2');")
    [void]$out.AppendLine("  unicode-range: $rng;")
    [void]$out.AppendLine($N)
    $n = $n + 1
}
[System.IO.File]::WriteAllText("C:\Users\khali\Desktop\..MKH\assets\css\fonts.css", $out.ToString(), (New-Object System.Text.UTF8Encoding($false)))
"wrote $n @font-face rules"
Get-ChildItem $fontsDir | ForEach-Object { "{0,-40} {1,6} KB" -f $_.Name, [Math]::Round($_.Length / 1KB) }
