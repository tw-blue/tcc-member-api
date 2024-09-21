Get-ChildItem -File -Recurse -Filter *.json -Path src\api | ForEach-Object {
    Write-Host "Compiling $($_.FullName)"
    npm exec oazapfts -- --optimistic $_.FullName ($_.FullName -replace '\.json', '.ts')
}
