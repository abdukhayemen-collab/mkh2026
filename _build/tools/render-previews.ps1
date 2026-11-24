$ErrorActionPreference = "Stop"
$root = "C:\Users\khali\Desktop\..MKH"
$src = "$root\works-src"
New-Item -ItemType Directory -Path $src -Force | Out-Null

# ---------------------------------------------------------------- PDF rendering
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$exts = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asTaskGeneric = ($exts | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
        $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
$asTaskAction = ($exts | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
        $_.GetParameters()[0].ParameterType.FullName -eq 'Windows.Foundation.IAsyncAction' })[0]

function Await($op, $type) {
    $m = $asTaskGeneric.MakeGenericMethod($type)
    $t = $m.Invoke($null, @($op))
    try { $t.Wait(-1) | Out-Null } catch { throw $_.Exception.InnerException.InnerException }
    $t.Result
}
function AwaitAction($op) {
    $t = $asTaskAction.Invoke($null, @($op)); $t.Wait(-1) | Out-Null
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime] | Out-Null

function Render-PdfPages {
    param([string]$PdfPath, [string]$Prefix, [int]$Width = 1600, [int]$MaxPages = 4)
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($PdfPath)) ([Windows.Storage.StorageFile])
    $doc = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
    $n = [Math]::Min($MaxPages, [int]$doc.PageCount)
    "$Prefix : $($doc.PageCount) pages, rendering $n"
    for ($i = 0; $i -lt $n; $i++) {
        $page = $doc.GetPage([uint32]$i)
        $out = "$src\$Prefix-p$($i+1).png"
        [System.IO.File]::WriteAllBytes($out, @())
        $sf = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($out)) ([Windows.Storage.StorageFile])
        $stream = Await ($sf.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)) ([Windows.Storage.Streams.IRandomAccessStream])
        $opts = New-Object Windows.Data.Pdf.PdfPageRenderOptions
        $opts.DestinationWidth = [uint32]$Width
        AwaitAction ($page.RenderToStreamAsync($stream, $opts))
        $stream.Dispose(); $page.Dispose()
        $mb = [Math]::Round((Get-Item $out).Length / 1KB)
        "  $out (${mb} KB)"
    }
    $doc = $null
}

$asciiStatic = "$src\_in_static.pdf"
$asciiResearch = "$src\_in_research.pdf"
if (-not (Test-Path $asciiStatic)) { Copy-Item "$root\نماذج عروض تقديمية ثابتة.pdf" $asciiStatic -Force }
if (-not (Test-Path $asciiResearch)) { Copy-Item "$root\نموذج بحث.pdf" $asciiResearch -Force }

Render-PdfPages -PdfPath $asciiStatic -Prefix "static-slides" -Width 1700 -MaxPages 4
Render-PdfPages -PdfPath $asciiResearch -Prefix "research-paper" -Width 1500 -MaxPages 3

# ------------------------------------------------------- PowerPoint slide export
$app = New-Object -ComObject PowerPoint.Application
try { $app.Visible = $true } catch { }
$pptxDir = "$src\animated-deck"
New-Item -ItemType Directory -Path $pptxDir -Force | Out-Null
$pptxIn = "$src\_in_animated.pptx"
if (-not (Test-Path $pptxIn)) {
    $found = Get-ChildItem -LiteralPath $root -File -Filter *.pptx | Select-Object -First 1
    Copy-Item -LiteralPath $found.FullName $pptxIn -Force
}
$pres = $app.Presentations.Open($pptxIn, $true, $false, $false)
"pptx slides: $($pres.Slides.Count)"
$pres.Export($pptxDir, "PNG", 1600, 900)
$pres.Close()
$app.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null
Get-ChildItem $pptxDir -File | ForEach-Object { "  $($_.Name) $([Math]::Round($_.Length/1KB)) KB" }
