# setup-mongocxx.ps1
# This PowerShell script installs the MongoDB C++ driver dependencies for Windows using vcpkg.
# Make sure you have vcpkg installed and added to your PATH.
# You can get vcpkg from: https://github.com/microsoft/vcpkg

Write-Output "Installing MongoDB C++ driver dependencies for Windows using vcpkg..."

# Check if vcpkg is available in the PATH
if (-not (Get-Command "vcpkg.exe" -ErrorAction SilentlyContinue)) {
    Write-Output "vcpkg.exe was not found in your PATH."
    Write-Output "Please install vcpkg from https://github.com/microsoft/vcpkg and add it to your PATH."
    exit 1
}

# Optionally, you can set the triplet if needed (default is x64-windows)
$triplet = "x64-windows"

Write-Output "Installing mongo-cxx-driver for $triplet..."
& vcpkg.exe install mongo-cxx-driver:$triplet

if ($LASTEXITCODE -ne 0) {
    Write-Output "Installation failed. Please check the error messages above."
    exit 1
}

Write-Output "Installation complete!"
Write-Output "If you use Visual Studio, consider running: vcpkg integrate install"
Write-Output "For CMake projects, add the following flag to your cmake command:"
Write-Output "  -DCMAKE_TOOLCHAIN_FILE=<vcpkg-root>/scripts/buildsystems/vcpkg.cmake"
