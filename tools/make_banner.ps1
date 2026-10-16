# Builds images/hexapurr_evolution.png from the six step images.
# Usage (from repo root):  powershell -ExecutionPolicy Bypass -File tools\make_banner.ps1

Add-Type -AssemblyName System.Drawing

$root  = Split-Path -Parent $PSScriptRoot
$steps = Join-Path $root "images\steps"
$out   = Join-Path $root "images\hexapurr_evolution.png"

$tiles = @(
    @{ File = "step1_openai_outline.png"; Label = "STEP 1  OPENAI";  Note = "the outline" },
    @{ File = "step2_grok_head.png";      Label = "STEP 2  GROK";    Note = "the fur" },
    @{ File = "step3_claude_body.png";    Label = "STEP 3  CLAUDE";  Note = "the body" },
    @{ File = "step4_gemini_tail.png";    Label = "STEP 4  GEMINI";  Note = "the tail" },
    @{ File = "step5_metaai_glyphs.png";  Label = "STEP 5  META AI"; Note = "the glyphs" },
    @{ File = "step6_nvidia_final.png";   Label = "STEP 6  NVIDIA";  Note = "the soul" }
)

$cols = 3; $rows = 2
$tileW = 640; $tileH = 420
$capH = 70; $gap = 24; $headH = 150; $footH = 60
$W = $cols * $tileW + ($cols + 1) * $gap
$H = $headH + $rows * ($tileH + $capH) + ($rows - 1) * $gap + $footH

$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = "AntiAlias"
$g.InterpolationMode = "HighQualityBicubic"
$g.TextRenderingHint = "AntiAliasGridFit"
$g.Clear([System.Drawing.Color]::FromArgb(255, 8, 8, 8))

$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 240, 232))
$dim   = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(140, 140, 132))
$barBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 40, 40))
$frame = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(55, 55, 55)), 1

$fTitle = New-Object System.Drawing.Font "Consolas", 44, ([System.Drawing.FontStyle]::Bold)
$fSub   = New-Object System.Drawing.Font "Consolas", 18
$fLabel = New-Object System.Drawing.Font "Consolas", 17, ([System.Drawing.FontStyle]::Bold)
$fNote  = New-Object System.Drawing.Font "Consolas", 14

$center = New-Object System.Drawing.StringFormat
$center.Alignment = "Center"

$g.DrawString("-+-  H E X A P U R R  -+-", $fTitle, $white, (New-Object System.Drawing.RectangleF 0, 28, $W, 70), $center)
$g.DrawString("the cat of six minds  .  6 models  .  6 steps  .  16.6% each", $fSub, $dim, (New-Object System.Drawing.RectangleF 0, 96, $W, 40), $center)

for ($i = 0; $i -lt $tiles.Count; $i++) {
    $c = $i % $cols; $r = [math]::Floor($i / $cols)
    $x = $gap + $c * ($tileW + $gap)
    $y = $headH + $r * ($tileH + $capH + $gap)

    $img = [System.Drawing.Image]::FromFile((Join-Path $steps $tiles[$i].File))
    $scale = [math]::Min($tileW / $img.Width, $tileH / $img.Height)
    $dw = [int]($img.Width * $scale); $dh = [int]($img.Height * $scale)
    $g.DrawImage($img, [int]($x + ($tileW - $dw) / 2), [int]($y + ($tileH - $dh) / 2), $dw, $dh)
    $img.Dispose()
    $g.DrawRectangle($frame, $x, $y, $tileW, $tileH)

    $cy = $y + $tileH + 10
    $g.DrawString($tiles[$i].Label, $fLabel, $white, $x, $cy)
    $pct = @("16.6%", "33.3%", "50.0%", "66.6%", "83.3%", "100%")[$i]
    $sz = $g.MeasureString($pct, $fLabel)
    $g.DrawString($pct, $fLabel, $white, ($x + $tileW - $sz.Width), $cy)
    $g.DrawString($tiles[$i].Note, $fNote, $dim, $x, ($cy + 26))

    $barY = $cy + 50
    $g.FillRectangle($barBg, $x, $barY, $tileW, 6)
    $g.FillRectangle($white, $x, $barY, [int]($tileW * ($i + 1) / 6), 6)
}

$g.DrawString("OpenAI -> Grok -> Claude -> Gemini -> Meta AI -> NVIDIA", $fNote, $dim, (New-Object System.Drawing.RectangleF 0, ($H - 42), $W, 30), $center)

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Wrote $out"
