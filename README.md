# PetWhenua

A pet networking platform with a React (TypeScript) frontend and a .NET 8 (C#) backend using Entity Framework Core and SQL Server.

---

## Features

- User registration and authentication (JWT)
- Pet profiles (CRUD)
- SQL Server data persistence via EF Core
- CORS enabled for React frontend
- Swagger/OpenAPI documentation

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js & npm](https://nodejs.org/) (for frontend)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) (recommended)
- Azure account (for deployment)

---

## Backend Setup

1. **Clone the repository:**

2. **Configure the database:**
   - Update `appsettings.json` with your SQL Server connection string under `DefaultConnection`.

3. **Apply EF Core migrations:**

4. **Run the backend:**

The API will be available at `https://localhost:5001` (or as configured).

---

## Frontend Setup

1. **Navigate to the frontend directory:**

2. **Install dependencies:**

3. **Start the React app:**

The app will be available at `http://localhost:5173`.

---

## Azure Deployment

### Deploy Backend to Azure App Service

1. **Publish from Visual Studio:**
   - Right-click the backend project > **Publish**.
   - Select **Azure** > **Azure App Service (Windows)**.
   - Follow the prompts to create/select an App Service and publish.

2. **Configure Azure SQL Database:**
   - Create an Azure SQL Database in the Azure portal.
   - Update the App Service’s **Configuration** with your Azure SQL connection string as `DefaultConnection`.

3. **Apply Migrations:**
   - Run migrations locally with the Azure SQL connection string, or use the Kudu console/SSH on App Service to run: ```sh
 dotnet ef database update
 ```
### Deploy Frontend

- Use [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/) or [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/) for Node.js.

---

## API Documentation

- Swagger UI is available at `/swagger` when running in development mode.

---

## Environment Variables

- `JwtSettings:SecretKey`
- `JwtSettings:Issuer`
- `JwtSettings:Audience`
- `ConnectionStrings:DefaultConnection`

Set these in `appsettings.json` or in Azure App Service configuration.

---

## License

MIT (or your chosen license)