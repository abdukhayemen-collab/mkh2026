$ErrorActionPreference = "Stop"
$root = "C:\Users\khali\Desktop\..MKH"
$out = "$root\works-src"
New-Item -ItemType Directory -Path $out -Force | Out-Null

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
    $t = $asTaskAction.Invoke($null, @($op))
    try { $t.Wait(-1) | Out-Null } catch { throw $_.Exception.InnerException.InnerException }
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.FileProperties.StorageItemThumbnail, Windows.Storage.FileProperties, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.FileProperties.ThumbnailMode, Windows.Storage.FileProperties, ContentType = WindowsRuntime] | Out-Null

$vids = Get-ChildItem -LiteralPath $root -File -Filter *.mp4
$i = 0
foreach ($v in $vids) {
    $i++
    $target = "$out\vid-$i.mp4"
    Copy-Item -LiteralPath $v.FullName $target -Force
    "source: $($v.Name)  $([Math]::Round($v.Length/1MB,1)) MB -> vid-$i.mp4"
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($target)) ([Windows.Storage.StorageFile])
    $thumb = Await ($file.GetThumbnailAsync(
            [Windows.Storage.FileProperties.ThumbnailMode]::VideosView, 1600,
            [Windows.Storage.FileProperties.ThumbnailOptions]::ResizeThumbnail)) ([Windows.Storage.FileProperties.StorageItemThumbnail])
    if ($null -eq $thumb) { "  no thumbnail available"; continue }
    $size = [int]$thumb.Size
    $reader = [Windows.Storage.Streams.DataReader]::new($thumb.GetInputStreamAt(0))
    Await ($reader.LoadAsync([uint32]$size)) ([uint32]) | Out-Null
    $bytes = New-Object byte[] $size
    $reader.ReadBytes($bytes)
    $reader.Dispose(); $thumb.Dispose()
    $png = "$out\poster-$i.png"
    [System.IO.File]::WriteAllBytes($png, $bytes)
    Add-Type -AssemblyName System.Drawing
    $im = [System.Drawing.Image]::FromFile($png)
    "  poster-$i.png $($im.Width)x$($im.Height) $([Math]::Round($size/1KB)) KB"
    $im.Dispose()
}
