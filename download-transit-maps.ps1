# Download Transit Maps from UrbanRail.Net
# Run this script in PowerShell to download all transit map images

$outputDir = "$PSScriptRoot\public\transit-maps"

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "Created directory: $outputDir" -ForegroundColor Green
}

# Define the mapping of system IDs to their urbanrail.net image URLs
$transitMaps = @{
    "london-underground" = "https://www.urbanrail.net/eu/uk/lon/london-map-centre.png"
    "paris-metro" = "https://www.urbanrail.net/eu/fr/paris/paris-map-centre.png"
    "new-york-subway" = "https://www.urbanrail.net/am/nyrk/new-york-map.png"
    "tokyo-metro" = "https://www.urbanrail.net/as/jp/tokyo/tokyo-centre-map.png"
    "moscow-metro" = "https://www.urbanrail.net/eu/ru/mos/moscow-rail-map.png"
    "shanghai-metro" = "https://www.urbanrail.net/as/cn/shan/Shanghai-metro-map-2016x.jpg"
    "beijing-subway" = "https://www.urbanrail.net/as/cn/beij/beijing-metro-map.png"
    "seoul-metro" = "https://www.urbanrail.net/as/kr/seoul/seoul-centre-map.png"
    "hong-kong-mtr" = "https://www.urbanrail.net/as/cn/hong/hong-kong-map.png"
    "madrid-metro" = "https://www.urbanrail.net/eu/es/mad/madrid-metro-map.png"
    "barcelona-metro" = "https://www.urbanrail.net/eu/es/bcn/barcelona-metro-map.png"
    "berlin-ubahn" = "https://www.urbanrail.net/eu/de/b/berlin-map.png"
    "singapore-mrt" = "https://www.urbanrail.net/as/sing/singapore-centre-map.png"
    "toronto-ttc" = "https://www.urbanrail.net/am/toro/Toronto-metro-map.png"
    "sydney-metro" = "https://www.urbanrail.net/au/sydney/sydney-centre-map.png"
    "rome-metro" = "https://www.urbanrail.net/eu/it/rom/roma-map.png"
    "vienna-ubahn" = "https://www.urbanrail.net/eu/at/vienna/wien-map.png"
    "athens-metro" = "https://www.urbanrail.net/eu/gr/athens/athens-map.png"
    "lisbon-metro" = "https://www.urbanrail.net/eu/pt/lisboa/lisboa-map.png"
    "amsterdam-metro" = "https://www.urbanrail.net/eu/nl/ams/amsterdam-metro-map.png"
    "delhi-metro" = "https://www.urbanrail.net/as/in/delhi/delhi-map.png"
    "mexico-city-metro" = "https://www.urbanrail.net/am/mexi/mexico-map.png"
    "sao-paulo-metro" = "https://www.urbanrail.net/am/spau/sao-paulo-map.png"
    "cairo-metro" = "https://www.urbanrail.net/af/cairo/cairo-metro-map.png"
    "dubai-metro" = "https://www.urbanrail.net/as/dub/dubai-metro-map.png"
}

Write-Host "`nDownloading transit map images from UrbanRail.Net..." -ForegroundColor Cyan
Write-Host "Output directory: $outputDir`n" -ForegroundColor Gray

$successCount = 0
$failCount = 0

foreach ($system in $transitMaps.GetEnumerator()) {
    $systemId = $system.Key
    $imageUrl = $system.Value

    # Get file extension from URL
    $extension = [System.IO.Path]::GetExtension($imageUrl)
    $outputFile = Join-Path $outputDir "$systemId$extension"

    Write-Host "Downloading $systemId..." -NoNewline

    try {
        # Use Invoke-WebRequest to download the image
        $headers = @{
            "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            "Referer" = "https://www.urbanrail.net/"
        }

        Invoke-WebRequest -Uri $imageUrl -OutFile $outputFile -Headers $headers -ErrorAction Stop

        if (Test-Path $outputFile) {
            $fileSize = (Get-Item $outputFile).Length / 1KB
            Write-Host " OK ($([math]::Round($fileSize, 1)) KB)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " FAILED (file not created)" -ForegroundColor Red
            $failCount++
        }
    }
    catch {
        Write-Host " FAILED ($($_.Exception.Message))" -ForegroundColor Red
        $failCount++
    }

    # Small delay to be respectful to the server
    Start-Sleep -Milliseconds 500
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Download Complete!" -ForegroundColor Cyan
Write-Host "Successfully downloaded: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "Failed: $failCount" -ForegroundColor Red
}
Write-Host "Images saved to: $outputDir" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan
