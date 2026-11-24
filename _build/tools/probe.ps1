$ErrorActionPreference = "Stop"
# --- Office COM availability ---
foreach ($p in @('PowerPoint.Application','Word.Application')) {
    try { $o = New-Object -ComObject $p; "$p => AVAILABLE"; $o.Quit() } catch { "$p => NOT AVAILABLE" }
}
# --- WinRT PDF renderer availability ---
try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $t = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
    "WinRT PdfDocument => AVAILABLE ($($t.FullName))"
} catch { "WinRT PdfDocument => NOT AVAILABLE : $($_.Exception.Message)" }
