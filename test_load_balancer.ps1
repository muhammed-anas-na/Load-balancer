# Number of Requests
$requests = 10

# URL of the Load balancer
$url = "http://localhost:3000"

# Loop to send requests
for ($i = 0; $i -lt $requests; $i++) {
    Start-Job -ScriptBlock {
        Invoke-WebRequest -Uri $using:url
    }
}

# Wait for all jobs to complete
Get-Job | Wait-Job

Write-Output "All requests have been sent."
