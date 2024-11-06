Get-ChildItem -File -Recurse -Filter *.json -Path src\api | ForEach-Object {
    Write-Host "Compiling $($_.FullName)"
    npx oazapfts -- --optimistic $_.FullName ($_.FullName -replace '\.json', '.ts')
}
