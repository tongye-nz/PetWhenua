# Complete Mock Data Seeding with New Admin
# Run this AFTER promoting the tempAdmin user to site_admin role

$base = "https://petwhenua-gpggdjawh0duc2du.australiaeast-01.azurewebsites.net"

Write-Host "=== COMPLETE MOCK DATA SEEDING ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login with the new admin
Write-Host "1. Logging in with temporary admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        usernameOrEmail = "tempAdmin"
        password = "AdminPass123!"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    $adminUser = $loginResponse.user
    
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "User: $($adminUser.firstName) $($adminUser.lastName) ($($adminUser.role))" -ForegroundColor White
    
    if ($adminUser.role -ne "site_admin") {
        Write-Host "❌ User role is '$($adminUser.role)' not 'site_admin'" -ForegroundColor Red
        Write-Host "Please run the promote-user-to-admin.sql script first!" -ForegroundColor Yellow
        return
    }
    
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you've promoted the user to site_admin role!" -ForegroundColor Yellow
    return
}

$headers = @{"Authorization" = "Bearer $token"}

# Step 2: Seed the mock data
Write-Host "`n2. Seeding full mock data..." -ForegroundColor Yellow
try {
    $seedResult = Invoke-RestMethod -Uri "$base/api/admin/seed-mock-data" -Method POST -Headers $headers -ContentType "application/json"
    Write-Host "✅ Mock data seeding completed!" -ForegroundColor Green
    Write-Host "Result: $($seedResult.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Seeding failed: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Step 3: Get the final summary
Write-Host "`n3. Getting mock data summary..." -ForegroundColor Yellow
try {
    $summary = Invoke-RestMethod -Uri "$base/api/admin/mock-data-summary" -Headers $headers
    
    Write-Host "`n=== FINAL MOCK DATA SUMMARY ===" -ForegroundColor Green
    Write-Host "Users: $($summary.userCount)" -ForegroundColor White
    Write-Host "Pets: $($summary.petCount)" -ForegroundColor White
    Write-Host "Posts: $($summary.postCount)" -ForegroundColor White
    Write-Host "Comments: $($summary.commentCount)" -ForegroundColor White
    Write-Host "Follows: $($summary.followCount)" -ForegroundColor White
    Write-Host "Pet Connections: $($summary.petConnectionCount)" -ForegroundColor White
    Write-Host "Locations: $($summary.locationsWithUsers -join ', ')" -ForegroundColor White
    
    if ($summary.userCount -ge 20) {
        Write-Host "`n🎉 SUCCESS! Full mock dataset created!" -ForegroundColor Green
        
        Write-Host "`n=== TEST CREDENTIALS ===" -ForegroundColor Cyan
        Write-Host "Site Admin: siteadmin@petwhenua.co.nz / TestPass123!" -ForegroundColor White
        Write-Host "Test Member: member01@petwhenua.co.nz / TestPass123!" -ForegroundColor White
        Write-Host "Vet: vet01@petwhenua.co.nz / TestPass123!" -ForegroundColor White
        Write-Host "Meetup Admin: meetupadmin01@petwhenua.co.nz / TestPass123!" -ForegroundColor White
        
        Write-Host "`n=== USER BREAKDOWN ===" -ForegroundColor Cyan
        foreach ($role in $summary.usersByRole.Keys) {
            Write-Host "$role`: $($summary.usersByRole[$role])" -ForegroundColor White
        }
        
        Write-Host "`n=== POST BREAKDOWN ===" -ForegroundColor Cyan
        foreach ($postType in $summary.postsByType.Keys) {
            Write-Host "$postType`: $($summary.postsByType[$postType])" -ForegroundColor White
        }
        
        Write-Host "`nFrontend URL: https://orange-plant-0ccfa0d00.1.azurestaticapps.net" -ForegroundColor Yellow
        Write-Host "All data follows NZ timezone and location preferences!" -ForegroundColor Green
        
    } else {
        Write-Host "`n⚠️ Partial success - only $($summary.userCount) users created" -ForegroundColor Yellow
        Write-Host "Expected 21+ users. The seeding may have only updated existing data." -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Could not get summary: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== CLEANUP ===" -ForegroundColor Cyan
Write-Host "The temporary admin user (tempAdmin) can be deleted after testing if desired." -ForegroundColor Gray
Write-Host "The mock data now includes a proper site admin: siteadmin@petwhenua.co.nz" -ForegroundColor Gray 