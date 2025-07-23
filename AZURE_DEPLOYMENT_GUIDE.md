# Azure Deployment Guide with Mock Data

This guide explains how to deploy PetWhenua to Azure Web App and seed mock data using the manual admin endpoint approach.

## 🚀 **Deployment Steps**

### **Step 1: Prepare for Deployment**

1. **Build the React app**:
   ```bash
   cd react-app
   npm run build
   cd ..
   ```

2. **Verify sample images are included**:
   - Ensure `wwwroot/uploads/samples/` contains all your images
   - Images will be automatically included in deployment via `.csproj` configuration

### **Step 2: Deploy to Azure Web App**

**Option A: Visual Studio Publish**
1. Right-click project → Publish
2. Select Azure Web App
3. Configure your app service
4. Publish

**Option B: Azure CLI**
```bash
# Build and publish
dotnet publish -c Release -o ./publish

# Deploy using Azure CLI (replace with your app name)
az webapp deploy --resource-group YourResourceGroup --name YourAppName --src-path ./publish.zip
```

**Option C: GitHub Actions**
```yaml
# Add to .github/workflows/deploy.yml
- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    app-name: 'your-app-name'
    publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

### **Step 3: Configure Azure Environment Variables**

In Azure Portal → App Service → Configuration → Application Settings:

| Name | Value |
|------|-------|
| `AZURE_SQL_CONNECTION_STRING` | Your Azure SQL connection string |
| `JWT_SECRET_KEY` | Strong JWT secret (minimum 32 characters) |

**Example JWT Secret**:
```
YourProductionJwtSecretKey123456789012345678901234567890
```

### **Step 4: Verify Deployment**

1. **Check app is running**: Visit `https://your-app.azurewebsites.net`
2. **Test API health**: `GET https://your-app.azurewebsites.net/api/posts/health`
3. **Verify images path**: Sample images should be accessible at:
   ```
   https://your-app.azurewebsites.net/uploads/samples/pets/cat-01.jpg
   ```

---

## 📊 **Mock Data Seeding**

### **Step 1: Create Site Admin Account**

First, create a site admin account to access seeding endpoints:

```bash
POST https://your-app.azurewebsites.net/api/auth/register
Content-Type: application/json

{
  "username": "siteadmin",
  "email": "admin@yourcompany.com",
  "password": "YourStrongPassword123!",
  "firstName": "Site",
  "lastName": "Admin"
}
```

### **Step 2: Update User Role to Site Admin**

**Option A: Direct SQL Update** (Azure SQL Query Editor)
```sql
UPDATE Users 
SET Role = 'site_admin' 
WHERE Email = 'admin@yourcompany.com';
```

**Option B: Temporary Code** (Add temporarily, then remove)
```csharp
// In Program.cs after app starts, run once, then remove
using var scope = app.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
var user = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@yourcompany.com");
if (user != null) {
    user.Role = "site_admin";
    await context.SaveChangesAsync();
}
```

### **Step 3: Login as Site Admin**

```bash
POST https://your-app.azurewebsites.net/api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "admin@yourcompany.com",
  "password": "YourStrongPassword123!"
}
```

**Save the JWT token from response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires": "2025-01-25T10:00:00Z",
  "user": { ... }
}
```

### **Step 4: Check Database Status**

```bash
GET https://your-app.azurewebsites.net/api/admin/database-status
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Step 5: Seed Mock Data**

```bash
POST https://your-app.azurewebsites.net/api/admin/seed-mock-data?forceRecreate=false
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Mock data seeded successfully",
  "summary": {
    "userCount": 21,
    "petCount": 65,
    "postCount": 170,
    "commentCount": 210,
    "followCount": 84,
    "petConnectionCount": 156,
    "locationsWithUsers": ["Auckland, Auckland City", "Wellington, Wellington City", ...],
    "usersByRole": {"member": 10, "meetup_admin": 5, "vet": 5, "site_admin": 1},
    "postsByType": {"Moment": 120, "BuySell": 20, "Meetup": 15, "Library": 10, "Announcement": 5}
  }
}
```

### **Step 6: Verify Mock Data**

1. **Check users**: `GET https://your-app.azurewebsites.net/api/users`
2. **Check posts**: `GET https://your-app.azurewebsites.net/api/posts?page=1&pageSize=10`
3. **Test login with mock user**:
   ```json
   {
     "usernameOrEmail": "member01@petwhenua.co.nz",
     "password": "TestPass123!"
   }
   ```

---

## 🔧 **Management Commands**

### **Get Mock Data Summary**
```bash
GET https://your-app.azurewebsites.net/api/admin/mock-data-summary
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Re-seed Data (Force Recreate)**
```bash
POST https://your-app.azurewebsites.net/api/admin/seed-mock-data?forceRecreate=true
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Clear All Mock Data**
```bash
DELETE https://your-app.azurewebsites.net/api/admin/clear-mock-data
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🧪 **Test Accounts**

After seeding, you can login with these accounts (password: `TestPass123!`):

| Role | Email | Location |
|------|--------|----------|
| Site Admin | siteadmin@petwhenua.co.nz | Auckland |
| Meetup Admin | meetupadmin01@petwhenua.co.nz | Auckland |
| Vet | vet01@petwhenua.co.nz | Auckland |
| Member | member01@petwhenua.co.nz | Auckland |
| Member | member03@petwhenua.co.nz | Wellington |

**Features to Test**:
- ✅ User registration and authentication
- ✅ Posts pagination (10/20/30 per page)
- ✅ Image variety in posts and pets
- ✅ Location-based user follows and pet connections
- ✅ Role-based post creation permissions
- ✅ Real-time notifications and chat

---

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Sample Images Not Loading**
- Check images exist at: `https://your-app.azurewebsites.net/uploads/samples/pets/cat-01.jpg`
- Verify `.csproj` includes sample images in deployment
- Check Azure App Service logs

**2. Mock Data Seeding Fails**
- Verify JWT token is valid and user has `site_admin` role
- Check Azure SQL connection string is correct
- Review Application Insights for detailed errors

**3. Database Connection Issues**
- Verify `AZURE_SQL_CONNECTION_STRING` environment variable
- Check Azure SQL firewall allows Azure services
- Test connection from Azure Cloud Shell

**4. Authorization Errors**
- Ensure JWT secret matches between environments
- Check token expiration (24 hours default)
- Verify user role is correctly set to `site_admin`

### **Logs and Monitoring**

**View Logs**:
```bash
# Azure CLI
az webapp log tail --resource-group YourResourceGroup --name YourAppName

# Or in Azure Portal: App Service → Monitoring → Log stream
```

**Application Insights**: Monitor API calls, errors, and performance

---

## 🎯 **Success Checklist**

- [ ] App deployed to Azure Web App
- [ ] Environment variables configured
- [ ] Sample images accessible
- [ ] Site admin account created and role assigned
- [ ] Mock data seeded successfully
- [ ] Test accounts working
- [ ] Posts pagination functional
- [ ] Images showing variety

**🎉 Your PetWhenua app is now live with realistic mock data on Azure!** 