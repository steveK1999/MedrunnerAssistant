import { spawn } from "node:child_process";

// Draws configurable overlay across chosen monitor(s).
// config: { allMonitors?: boolean, monitorIndex?: number, durationMs?: number,
//           position?: 'top'|'center', borderStyle?: 'none'|'glow'|'waves', backgroundStyle?: 'none'|'red80' }
export function showAlertOverlay(configOrIndex = 0, durationMs = 3000) {
	if (process.platform !== "win32") {
		console.warn("Alert overlay only supported on Windows; skipping overlay.");
		return Promise.resolve();
	}

    // Support both old API (number) and new API (object with config)
    let screenIndex = 0;
    let showAllMonitors = false;
    let overlayDuration = 3000;
    let position = 'top';
    let textPercent = 100;
    let borderStyle = 'glow';
    let backgroundStyle = 'none';

    if (typeof configOrIndex === 'object' && configOrIndex !== null) {
        showAllMonitors = configOrIndex.allMonitors === true;
        screenIndex = configOrIndex.monitorIndex || 0;
        overlayDuration = Number.isFinite(configOrIndex.durationMs) ? configOrIndex.durationMs : 3000;
        position = (configOrIndex.position === 'center') ? 'center' : 'top';
        textPercent = Number.isFinite(configOrIndex.textPercent) ? configOrIndex.textPercent : 100;
        borderStyle = ['none','glow','waves'].includes(configOrIndex.borderStyle) ? configOrIndex.borderStyle : 'glow';
        backgroundStyle = ['none','red80'].includes(configOrIndex.backgroundStyle) ? configOrIndex.backgroundStyle : 'none';
    } else {
        screenIndex = Number.parseInt(configOrIndex, 10);
        overlayDuration = Number.isFinite(durationMs) && durationMs > 0 ? durationMs : 3000;
    }

    const parsedIndex = Number.isNaN(screenIndex) ? 0 : screenIndex;
    const safeDuration = overlayDuration;

    const psScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$index = ${parsedIndex}
$duration = ${safeDuration}
$showAll = ${showAllMonitors ? 'true' : 'false'}
$position = '${position}'
$textPercent = ${textPercent}
$borderStyle = '${borderStyle}'
$backgroundStyle = '${backgroundStyle}'
$screens = [System.Windows.Forms.Screen]::AllScreens
if ($screens.Count -eq 0) { return }
if (-not $showAll) {
    if ($index -lt 0 -or $index -ge $screens.Count) { $index = 0 }
    $screens = @($screens[$index])
}

# Create forms for each screen
$forms = @()
foreach ($screen in $screens) {
    $form = New-Object System.Windows.Forms.Form
    $form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
    $form.StartPosition = 'Manual'
    $form.ShowInTaskbar = $false
    $form.TopMost = $true
    $form.BackColor = [System.Drawing.Color]::FromArgb(1,0,0,0)
    $form.TransparencyKey = $form.BackColor
    $form.Bounds = $screen.Bounds
    $form.DoubleBuffered = $true

    # State variables for animations
    $global:textAlpha = 255
    $global:sliderY = -200
    $global:pulseUp = $true
    $global:wavePhase = 0
    $global:pulsePhase = 0

    $form.Add_Paint({
        param($sender, $e)
        $g = $e.Graphics
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
        $rect = $sender.ClientRectangle

        # Background style
        if ($backgroundStyle -eq 'red80') {
            $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(204,255,0,0))
            $g.FillRectangle($bgBrush, $rect)
            $bgBrush.Dispose()
        }

        # Border styles
        if ($borderStyle -eq 'glow') {
            for ($i=0; $i -lt 6; $i++) {
                $alpha = 180 - ($i * 25)
                $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb([Math]::Max(0,$alpha),255,0,0), 12 - $i)
                $r = $rect
                $r.Inflate(-6 - ($i*2), -6 - ($i*2))
                $g.DrawRectangle($pen, $r)
                $pen.Dispose()
            }
        } elseif ($borderStyle -eq 'waves') {
            $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180,255,0,0), 4)
            $pointsLeft = @()
            for ($y=0; $y -lt $rect.Height; $y+=12) {
                $x = 10 + [Math]::Sin(($y + $global:wavePhase)/18.0) * 18
                $pointsLeft += New-Object System.Drawing.PointF($x, $y)
            }
            if ($pointsLeft.Count -gt 1) { $g.DrawCurve($pen, $pointsLeft) }
            $pointsRight = @()
            for ($y=0; $y -lt $rect.Height; $y+=12) {
                $x = $rect.Width - 10 + [Math]::Sin(($y + $global:wavePhase)/18.0) * 18
                $pointsRight += New-Object System.Drawing.PointF($x, $y)
            }
            if ($pointsRight.Count -gt 1) { $g.DrawCurve($pen, $pointsRight) }
            $pen.Dispose()
        }

        # Text drawing
        if ($position -eq 'top') {
            $baseSize = 48
            $scale = 1.0 + [Math]::Sin($global:pulsePhase / 10.0) * 0.06
            $fontSize = [Math]::Max(36, [Math]::Min(72, $baseSize * $scale))
            $font = New-Object System.Drawing.Font('Segoe UI', [float]$fontSize, [System.Drawing.FontStyle]::Bold)
        } else {
            $font = New-Object System.Drawing.Font('Segoe UI', 48, [System.Drawing.FontStyle]::Bold)
        }
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb([Math]::Min(255,[Math]::Max(0,$global:textAlpha)),255,0,0))
        $text = 'ALERT'
        $size = $g.MeasureString($text, $font)
        # Compute base size from percent (70% => 400)
        $baseSize = [float]($textPercent * (400.0 / 70.0))
        if ($baseSize -lt 10) { $baseSize = 10 }
        $emSize = $baseSize

        # Build path to draw outlined text
        $format = New-Object System.Drawing.StringFormat
        $fontFamily = New-Object System.Drawing.FontFamily('Segoe UI')
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        if ($position -eq 'center') {
            $x = [Math]::Max(0, ($rect.Width) / 2)
            $y = [Math]::Max(0, ($rect.Height) / 2)
            $origin = New-Object System.Drawing.PointF(0,0)
            $path.AddString($text, $fontFamily, [int][System.Drawing.FontStyle]::Bold, [float]$emSize, $origin, $format)
            # Measure approximate size
            $bounds = $path.GetBounds()
            $dx = ($rect.Width - $bounds.Width) / 2 - $bounds.X
            $dy = ($rect.Height - $bounds.Height) / 2 - $bounds.Y
            $matrix = New-Object System.Drawing.Drawing2D.Matrix
            $matrix.Translate([float]$dx, [float]$dy)
            $path.Transform($matrix)
            $matrix.Dispose()
        } else {
            $origin = New-Object System.Drawing.PointF(0,0)
            $path.AddString($text, $fontFamily, [int][System.Drawing.FontStyle]::Bold, [float]$emSize, $origin, $format)
            $bounds = $path.GetBounds()
            $dx = ($rect.Width - $bounds.Width) / 2 - $bounds.X
            $dy = 60 - $bounds.Y
            $matrix = New-Object System.Drawing.Drawing2D.Matrix
            $matrix.Translate([float]$dx, [float]$dy)
            $path.Transform($matrix)
            $matrix.Dispose()
        }

        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, [float]([Math]::Max(2, $emSize/20)))
        $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
        $g.FillPath($brush, $path)
        $g.DrawPath($pen, $path)
        $pen.Dispose()
        $path.Dispose()
        $fontFamily.Dispose()
        $format.Dispose()
        $brush.Dispose()
    })

    $form.Show()
    $forms += $form
}

# Blinking timer
# Animation timer only when needed (waves border)
$animTimer = New-Object System.Windows.Forms.Timer
$animTimer.Interval = 40
$animTimer.Add_Tick({ 
    # Text: constant opacity, no animation
    $global:textAlpha = 255
    if ($borderStyle -eq 'waves') {
        $global:wavePhase += 8
        foreach ($form in $forms) { $form.Invalidate() }
    } else {
        $animTimer.Stop()
    }
})
$animTimer.Start()

# Initial render
foreach ($form in $forms) { $form.Invalidate() }

# Close timer
$closeTimer = New-Object System.Windows.Forms.Timer
$closeTimer.Interval = $duration
$closeTimer.Add_Tick({
    $closeTimer.Stop()
    $animTimer.Stop()
    foreach ($form in $forms) {
        $form.Close()
    }
})
$closeTimer.Start()

[System.Windows.Forms.Application]::Run($forms[0])
`;

	const encoded = Buffer.from(psScript, "utf16le").toString("base64");

	return new Promise((resolve, reject) => {
		const child = spawn("powershell.exe", [
			"-NoProfile",
			"-ExecutionPolicy",
			"Bypass",
			"-EncodedCommand",
			encoded,
		], {
			windowsHide: true,
			stdio: "ignore",
		});

		child.on("error", reject);
		child.on("exit", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Alert overlay PowerShell exited with code ${code}`));
			}
		});
	});
}
