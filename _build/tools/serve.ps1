param(
    [int]$Port = 4321,
    [string]$Root = "C:\Users\khali\Desktop\..MKH",
    [switch]$Once
)
$ErrorActionPreference = "Stop"
$mime = @{
    ".html" = "text/html; charset=utf-8"; ".htm" = "text/html; charset=utf-8"
    ".css" = "text/css; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"; ".mjs" = "text/javascript; charset=utf-8"
    ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"; ".gif" = "image/gif"; ".svg" = "image/svg+xml"
    ".ico" = "image/x-icon"; ".avif" = "image/avif"
    ".mp4" = "video/mp4"; ".webm" = "video/webm"; ".ogv" = "video/ogg"
    ".pdf" = "application/pdf"; ".pptx" = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ".docx" = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ".woff" = "font/woff"; ".woff2" = "font/woff2"; ".ttf" = "font/ttf"; ".otf" = "font/otf"
    ".txt" = "text/plain; charset=utf-8"; ".md" = "text/plain; charset=utf-8"
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://127.0.0.1:$Port/"
$listener.Prefixes.Add($prefix)
try { $listener.Start() } catch {
    Write-Error "Could not start on $prefix : $($_.Exception.Message)"; exit 1
}
Write-Host "Serving $Root on $prefix"

while ($listener.IsListening) {
    try { $ctx = $listener.GetContext() } catch { break }
    $req = $ctx.Request; $res = $ctx.Response
    try {
        $res.Headers.Add("Cache-Control", "no-store")
        $res.Headers.Add("Access-Control-Allow-Origin", "*")

        # ---- capture sink: POST /__save/<name> writes the raw body under _build/captures ----
        if ($req.HttpMethod -eq "POST" -and $req.Url.AbsolutePath -like "/__save/*") {
            $name = [System.IO.Path]::GetFileName([System.Uri]::UnescapeDataString($req.Url.AbsolutePath.Substring(8)))
            if ([string]::IsNullOrWhiteSpace($name)) { $name = "capture.jpg" }
            $dir = Join-Path $Root "_build\captures"
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            $dest = Join-Path $dir $name
            $sr = New-Object System.IO.StreamReader($req.InputStream, [Text.Encoding]::UTF8)
            $text = $sr.ReadToEnd()
            $sr.Dispose()
            $bytes = $null
            if ($text.StartsWith("data:")) {
                $comma = $text.IndexOf(",")
                $bytes = [Convert]::FromBase64String($text.Substring($comma + 1))
            }
            elseif ($req.ContentType -like "image/*") {
                $bytes = [Text.Encoding]::GetEncoding(28591).GetBytes($text)
            }
            if ($null -eq $bytes) {
                $res.StatusCode = 415
                $body = [Text.Encoding]::UTF8.GetBytes("unsupported payload (content-type $($req.ContentType), $($text.Length) chars)")
            }
            else {
                [System.IO.File]::WriteAllBytes($dest, $bytes)
                $res.StatusCode = 200
                $body = [Text.Encoding]::UTF8.GetBytes("saved $name ($($bytes.Length) bytes)")
            }
            $res.ContentType = "text/plain; charset=utf-8"
            $res.ContentLength64 = $body.Length
            $res.OutputStream.Write($body, 0, $body.Length)
            $res.OutputStream.Close(); $res.Close()
            if ($Once) { break } else { continue }
        }

        $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
        $full = [System.IO.Path]::GetFullPath((Join-Path $Root $rel))
        if (-not $full.StartsWith([System.IO.Path]::GetFullPath($Root))) {
            $res.StatusCode = 403; $body = [Text.Encoding]::UTF8.GetBytes("forbidden"); $res.OutputStream.Write($body, 0, $body.Length)
        }
        elseif (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
            $res.StatusCode = 404
            $body = [Text.Encoding]::UTF8.GetBytes("404 not found: $rel")
            $res.ContentType = "text/plain; charset=utf-8"
            $res.OutputStream.Write($body, 0, $body.Length)
        }
        else {
            $ext = [System.IO.Path]::GetExtension($full).ToLower()
            $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
            $fs = [System.IO.File]::OpenRead($full)
            $len = $fs.Length
            $start = 0; $end = $len - 1
            $range = $req.Headers["Range"]
            if ($range -and $range -match "bytes=(\d*)-(\d*)") {
                if ($matches[1] -ne "") { $start = [int64]$matches[1] }
                if ($matches[2] -ne "") { $end = [int64]$matches[2] }
                elseif ($matches[1] -ne "") { $end = $len - 1 }
                if ($start -gt $end -or $start -ge $len) { $start = 0; $end = $len - 1 }
                $res.StatusCode = 206
                $res.Headers.Add("Content-Range", "bytes $start-$end/$len")
                $res.Headers.Add("Accept-Ranges", "bytes")
            }
            else {
                $res.Headers.Add("Accept-Ranges", "bytes")
            }
            $count = $end - $start + 1
            $res.ContentLength64 = $count
            $fs.Position = $start
            $buf = New-Object byte[] 65536
            $remaining = $count
            while ($remaining -gt 0) {
                $toRead = [Math]::Min($buf.Length, $remaining)
                $read = $fs.Read($buf, 0, $toRead)
                if ($read -le 0) { break }
                $res.OutputStream.Write($buf, 0, $read)
                $remaining -= $read
            }
            $fs.Dispose()
        }
    }
    catch { Write-Host "ERR: $($_.Exception.Message)" }
    finally { try { $res.OutputStream.Close() } catch { }; try { $res.Close() } catch { } }
    if ($Once) { break }
}
$listener.Stop()
