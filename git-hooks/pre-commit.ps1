Get-ChildItem -File -Recurse -Filter *.json -Path src\api | ForEach-Object {
    Write-Host "Compiling $($_.FullName)"
    $outFile = ($_.FullName -replace '\.json', '.ts')
    npx oazapfts -- --optimistic $_.FullName $outFile
    git add $outFile
}
