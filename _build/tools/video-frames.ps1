$ErrorActionPreference = "Stop"
$root = "C:\Users\khali\Desktop\..MKH"
$out = "$root\_build\captures"
New-Item -ItemType Directory -Path $out -Force | Out-Null

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$exts = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asTaskGeneric = ($exts | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
        $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

function Await($op, $type) {
    $m = $asTaskGeneric.MakeGenericMethod($type)
    $t = $m.Invoke($null, @($op))
    try { $t.Wait(-1) | Out-Null } catch { throw $_.Exception.InnerException.InnerException }
    $t.Result
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.Streams.IBuffer, Windows.Storage.Streams, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaComposition, Windows.Media.Editing, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaClip, Windows.Media.Editing, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Editing.VideoFramePrecision, Windows.Media.Editing, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.FileProperties.VideoProperties, Windows.Storage.FileProperties, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.FileProperties.VideoOrientation, Windows.Storage.FileProperties, ContentType = WindowsRuntime] | Out-Null

function Grab-Frame {
    param([string]$Path, [string]$Name, [double[]]$Times, [int]$MaxW = 1400)
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($Path)) ([Windows.Storage.StorageFile])
    $props = Await ($file.Properties.GetVideoPropertiesAsync()) ([Windows.Storage.FileProperties.VideoProperties])
    $w = [int]$props.Width; $h = [int]$props.Height
    if ($props.Orientation -eq [Windows.Storage.FileProperties.VideoOrientation]::Rotation90 -or
        $props.Orientation -eq [Windows.Storage.FileProperties.VideoOrientation]::Rotation270) { $t = $w; $w = $h; $h = $t }
    "  $Name : ${w}x${h}  dur=$([Math]::Round($props.Duration.TotalSeconds,1))s  orient=$($props.Orientation)"

    $clip = Await ([Windows.Media.Editing.MediaClip]::CreateFromFileAsync($file)) ([Windows.Media.Editing.MediaClip])
    $comp = New-Object Windows.Media.Editing.MediaComposition
    $clips = [System.Collections.Generic.IList[Windows.Media.Editing.MediaClip]]$comp.Clips
    $clips.Add($clip)

    $scale = [Math]::Min(1.0, $MaxW / $w)
    $tw = [int][Math]::Round($w * $scale); $th = [int][Math]::Round($h * $scale)
    $i = 0
    foreach ($sec in $Times) {
        $i++
        if ($sec -ge $props.Duration.TotalSeconds) { $sec = $props.Duration.TotalSeconds - 0.4 }
        $stream = Await ($comp.GetThumbnailAsync(
                [TimeSpan]::FromSeconds($sec), $tw, $th,
                [Windows.Media.Editing.VideoFramePrecision]::NearestFrame)) ([Windows.Storage.Streams.IRandomAccessStreamWithContentType])
        if ($null -eq $stream) { "    t=$sec : null stream"; continue }
        $size = [int]$stream.Size
        $reader = [Windows.Storage.Streams.DataReader]::new($stream.GetInputStreamAt(0))
        Await ($reader.LoadAsync([uint32]$size)) ([uint32]) | Out-Null
        $bytes = New-Object byte[] $size
        $reader.ReadBytes($bytes)
        $reader.Dispose(); $stream.Dispose()
        $ext = if ($bytes[0] -eq 0x89) { "png" } else { "jpg" }
        $dest = "$out\$Name-$i.$ext"
        [System.IO.File]::WriteAllBytes($dest, $bytes)
        "    -> $Name-$i.$ext  t=$([Math]::Round($sec,1))s  $([Math]::Round($size/1KB)) KB"
    }
}

$vids = Get-ChildItem -LiteralPath $root -File -Filter *.mp4 | Sort-Object Name
Grab-Frame -Path $vids[0].FullName -Name "video-editing" -Times @(3, 12, 30, 60)
Grab-Frame -Path $vids[1].FullName -Name "pptx-game" -Times @(3, 12, 28, 40)
