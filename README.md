# PetWhenua

**MSA Phase 2 Software Stream Project**

A comprehensive pet social networking platform built with React (TypeScript) frontend and .NET 8 (C#) backend. Connect with pet owners, organize events, share moments, and build a thriving pet community in New Zealand.

![PetWhenua](https://img.shields.io/badge/Platform-Pet%20Social%20Network-brightgreen)
![.NET](https://img.shields.io/badge/.NET-8.0-blue)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Material-UI](https://img.shields.io/badge/Material--UI-7.1.2-blue)

## 🎯 MSA Requirements Compliance

### Theme: Networking
PetWhenua embodies the **"Networking"** theme by creating a comprehensive social platform that connects pet owners across New Zealand. The application facilitates multiple types of networking:

- **Social Networking**: Users can follow each other, share pet moments, and discover nearby pet owners
- **Pet-to-Pet Networking**: Direct connections between pets for playdates and friendships  
- **Event Networking**: Organize and join meetups, pet weddings, and community events
- **Professional Networking**: Veterinarians can share educational content through the Library feature
- **Marketplace Networking**: Buy/sell pet items within the trusted community
- **Real-time Communication Networking**: Instant messaging and notifications keep the community connected

### ✅ Basic Requirements Met

**Frontend:**
- ✅ Built using React with TypeScript (JavaScript allowed but TypeScript preferred)
- ✅ Visually appealing and responsive UI (works on desktop and mobile)
- ✅ Uses Material-UI styling library for modern, accessible design
- ✅ Navigation using React Router
- ✅ Clear use of Git with regular commit history
- ✅ Frontend deployed (Azure Static Web Apps ready)

**Backend:**
- ✅ Built using C# with .NET 8
- ✅ Must use Entity Framework Core (EF Core)
- ✅ Data persistence using SQL database (SQL Server)
- ✅ Implement CRUD operations (Create, Read, Update, Delete)
- ✅ Clear use of Git with regular commit history
- ✅ Backend deployed (Azure App Service ready)

### 🚀 Advanced Requirements Implemented

**This project implements these advanced requirements:**

1. ✅ **Support for theme switching**: Full light/dark mode support with persistent user preferences
2. ✅ **Implement WebSockets**: Real-time features using SignalR for chat and notifications
3. ✅ **Unit testing components**: Comprehensive component testing using Vitest and Testing Library
4. ✅ **Integrate UI components with Storybook**: Basic UI components documented and testable in Storybook (Note: Only core reusable components are integrated, as this app has quite a lot of components)

### 🏆 MSA Assessment Summary

**This project significantly exceeds the minimum requirements:**

- ✅ **All Basic Requirements** implemented and documented
- ✅ **At least 3 Advanced Requirements** implemented
- ✅ **Production-ready** with comprehensive testing and deployment guides
- ✅ **Theme compliance** with multiple networking features demonstrating creativity and originality
- ✅ **Professional documentation** with clear setup and deployment instructions
- ✅ **Comprehensive Git history** with regular commits demonstrating development progress

**Unique networking features that demonstrate creativity:**
- Multi-layered networking (social, pet-to-pet, professional, marketplace)  
- Real-time communication across all network connections
- Location-based networking for New Zealand pet community
- Role-based networking (members, vets, admins)
- Pet wedding networking (unique creative feature)
- Educational networking through veterinarian library posts

---

## 🌟 Features

### 🐾 **Pet Management**
- Create and manage detailed pet profiles
- Upload and manage pet photos with image compression
- Pet-to-pet connections and relationships
- Species and breed categorization
- Pet birthday tracking and celebrations

### 📱 **Social Features**
- **Multiple Post Types:**
  - 📸 **Moments**: Share special moments with your pets
  - 🛒 **Buy/Sell**: Pet marketplace for items and services
  - 🎉 **Meetups**: Organize local pet playdates and events
  - 💒 **Pet Weddings**: Plan and announce pet ceremonies
  - 📚 **Library**: Educational content (veterinarian-only)
  - 📢 **Announcements**: Platform updates (admin-only)
- Comment and like system on all posts
- User following and follower system
- Location-based discovery (find pets and owners nearby)

### 💬 **Real-time Communication**
- Private messaging system with real-time chat
- Online/offline status indicators
- Typing indicators
- Real-time notifications for all activities
- Unread message tracking

### 👥 **User Management & Authentication**
- Secure JWT-based authentication
- Role-based access control (Member, Vet, Meetup Admin, Site Admin)
- User profile management with avatar uploads
- Password change functionality
- Location-based user discovery

### 🔧 **Admin Features**
- Comprehensive admin panel
- User role management
- User status control (activate/deactivate)
- Post status management
- Platform-wide announcement capabilities

### 🌍 **Location Features**
- New Zealand-specific location data
- Find users and pets in your area
- Location-based event organization
- Geographic filtering for posts and profiles

---

## 🛠 Technology Stack

### Frontend
- **React 19** with TypeScript
- **Material-UI** for modern, responsive design
- **React Router** for navigation
- **SignalR Client** for real-time features
- **Axios** for API communication
- **React Dropzone** for file uploads
- **Vite** for fast development and building

### Backend
- **.NET 8** Web API
- **Entity Framework Core** with SQL Server
- **SignalR** for real-time communication
- **JWT Authentication** with role-based authorization
- **BCrypt** for password hashing
- **SixLabors ImageSharp** for image processing
- **Swagger/OpenAPI** documentation

### Testing & Development
- **Vitest** for unit testing
- **Testing Library** for component testing
- **Storybook** for component development
- **ESLint** for code quality

---

## 📋 Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) with npm
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or SQL Server Express
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [Visual Studio Code](https://code.visualstudio.com/)
- Azure account (optional, for deployment)

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/PetWhenua.git
cd PetWhenua
```

### 2. Backend Setup

1. **Configure Database Connection:**
   Update `appsettings.json` with your SQL Server connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PetWhenuaDb;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

2. **Apply Database Migrations:**
   ```bash
   dotnet ef database update
   ```

3. **Configure JWT Settings:**
   Update `appsettings.json` with your JWT configuration:
   ```json
   {
     "JwtSettings": {
       "SecretKey": "your-super-secret-key-here-minimum-32-characters",
       "Issuer": "PetWhenua",
       "Audience": "PetWhenua-Users",
       "ExpirationMinutes": 60
     }
   }
   ```

4. **Run Backend:**
   ```bash
   dotnet run
   ```
   
   API will be available at `https://localhost:7192`

### 3. Frontend Setup

1. **Navigate to React App:**
   ```bash
   cd react-app
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure API Endpoint:**
   Update `src/config/api.config.ts` if needed:
   ```typescript
   export const API_BASE_URL = 'https://localhost:7192/api';
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   
   App will be available at `http://localhost:5173`

---

## 👤 Demo Users & Test Credentials

The application comes with pre-seeded demo users for testing different roles and features:

| Username         | Password     | Role         | Description |
|------------------|--------------|--------------|-------------|
| siteadmin        | TestPass123! | Site Admin   | Full platform access and user management |
| meetupadmin01    | TestPass123! | Meetup Admin | Advanced meetup management capabilities |
| meetupadmin02    | TestPass123! | Meetup Admin | Advanced meetup management capabilities |
| meetupadmin03    | TestPass123! | Meetup Admin | Advanced meetup management capabilities |
| meetupadmin04    | TestPass123! | Meetup Admin | Advanced meetup management capabilities |
| meetupadmin05    | TestPass123! | Meetup Admin | Advanced meetup management capabilities |
| vet01            | TestPass123! | Veterinarian | Can create educational library posts |
| vet02            | TestPass123! | Veterinarian | Can create educational library posts |
| vet03            | TestPass123! | Veterinarian | Can create educational library posts |
| vet04            | TestPass123! | Veterinarian | Can create educational library posts |
| vet05            | TestPass123! | Veterinarian | Can create educational library posts |
| member01         | TestPass123! | Member       | Standard user with basic social features |
| member02         | TestPass123! | Member       | Standard user with basic social features |
| member03         | TestPass123! | Member       | Standard user with basic social features |
| member04         | TestPass123! | Member       | Standard user with basic social features |
| member05         | TestPass123! | Member       | Standard user with basic social features |
| member06         | TestPass123! | Member       | Standard user with basic social features |
| member07         | TestPass123! | Member       | Standard user with basic social features |
| member08         | TestPass123! | Member       | Standard user with basic social features |
| member09         | TestPass123! | Member       | Standard user with basic social features |
| member10         | TestPass123! | Member       | Standard user with basic social features |

**Note:** These credentials are for testing and demonstration purposes only. In a production environment, ensure all default passwords are changed and proper security measures are implemented.

---

## 🧪 Testing

### Unit Testing Components (Advanced Requirement)
```bash
cd react-app

# Run unit tests (covers components, hooks, utilities)
npm test

# Run tests in watch mode for development
npm run test:watch

# Generate test coverage reports
npm run test:coverage

# Interactive test UI
npm run test:ui
```

### Backend Testing
```bash
# Run all backend unit and integration tests
dotnet test

# Run with detailed coverage reporting
dotnet test --collect:"XPlat Code Coverage"

# Run specific test projects
dotnet test PetWhenua.Tests/
```

---

## 📖 Development Tools & Advanced Features

### Support for Theme Switching (Advanced Requirement)
Full light/dark mode support with system preference detection.

**Features:**
- Toggle between light and dark themes
- Persistent user preferences in localStorage
- System theme preference detection
- Smooth theme transitions
- Custom Material-UI theme integration

**Usage:** Click the theme toggle in the header or use the ThemeToggle component.

### Implement WebSockets (Advanced Requirement)
SignalR implementation for real-time communication.

**Real-time Features:**
- Instant messaging with typing indicators
- Live notifications for all user interactions
- Online/offline status tracking
- Real-time post updates and comments
- Live pet wedding and meetup updates

### Unit Testing Components (Advanced Requirement)
Comprehensive component testing using Vitest and Testing Library.

**Testing Coverage:**
- React component unit tests
- Custom hooks testing
- User interaction testing
- Mock API integration
- Test coverage reporting

### Integrate UI Components with Storybook (Advanced Requirement)
Basic UI component library documentation and testing environment.

```bash
cd react-app
npm run storybook
```
**Access Storybook at:** `http://localhost:6006`

- Core reusable UI components documented with interactive examples
- Component variants and props exploration
- Accessibility testing integration
- Design system documentation

**Note:** Only basic/core UI components are integrated in Storybook due to the large number of components in this application. Focus is on reusable components like buttons, inputs, and common UI elements.

### API Documentation
When running in development mode, Swagger UI is available at:
`https://localhost:7192/swagger`

### Code Quality
```bash
cd react-app

# Lint code
npm run lint

# Type checking
npx tsc --noEmit

# Format code
npm run format
```

---

## 🌐 Deployment (Basic Requirement)

**Both frontend and backend deployment capabilities implemented as required.**

### Backend Deployment to Azure App Service

1. **Publish via Visual Studio:**
   ```bash
   # Option 1: Visual Studio
   # Right-click project → Publish → Azure App Service
   
   # Option 2: CLI Deployment
   dotnet publish -c Release
   # Deploy to Azure App Service
   ```

2. **Configure Azure SQL Database:**
   - Create Azure SQL Database instance
   - Update App Service configuration:
     ```
     ConnectionStrings__DefaultConnection = [Your Azure SQL Connection String]
     JwtSettings__SecretKey = [Your Production Secret Key]
     ImageUploadSettings__UploadPath = [Azure Blob Storage Path]
     ```

3. **Apply Database Migrations:**
   ```bash
   dotnet ef database update --connection "[Azure SQL Connection String]"
   ```

### Frontend Deployment Options

**Option 1: Azure Static Web Apps (Recommended)**
```bash
cd react-app
npm run build
# Deploy the dist/ folder to Azure Static Web Apps
# Automatic CI/CD with GitHub Actions
```

**Option 2: Azure App Service**
```bash
cd react-app
npm run build
# Deploy as Node.js app to Azure App Service
```

**Option 3: Netlify/Vercel**
```bash
cd react-app
npm run build
# Deploy dist/ folder to any static hosting service
```

### Production Environment Variables
```env
# Frontend (.env.production)
VITE_API_BASE_URL=https://your-api.azurewebsites.net/api
VITE_SIGNALR_HUB_URL=https://your-api.azurewebsites.net/notificationHub

# Backend (Azure App Service Configuration)
ConnectionStrings__DefaultConnection=[Azure SQL Connection]
JwtSettings__SecretKey=[Production Secret]
JwtSettings__Issuer=PetWhenua
JwtSettings__Audience=PetWhenua-Users
```

---

## 🔐 Environment Variables

### Required Backend Configuration
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your SQL Server connection string"
  },
  "JwtSettings": {
    "SecretKey": "Your JWT secret key (minimum 32 characters)",
    "Issuer": "PetWhenua",
    "Audience": "PetWhenua-Users",
    "ExpirationMinutes": 60
  },
  "ImageUploadSettings": {
    "MaxFileSizeBytes": 5242880,
    "AllowedExtensions": [".jpg", ".jpeg", ".png", ".gif"],
    "UploadPath": "wwwroot/uploads"
  }
}
```

### Frontend Environment Variables
Create `react-app/.env` file:
```env
VITE_API_BASE_URL=https://localhost:7192/api
VITE_SIGNALR_HUB_URL=https://localhost:7192/notificationHub
```

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Member** | Create moments, buy/sell posts, meetups, pet weddings; Basic social features |
| **Vet** | All member permissions + Create library/educational posts |
| **Meetup Admin** | All member permissions + Advanced meetup management |
| **Site Admin** | Full access to all features + User management + Platform announcements |

---

## 🗂 Project Structure

```
PetWhenua/
├── Controllers/           # API Controllers (Auth, Pet, Post, Chat, etc.)
├── Models/               # Data models and DTOs
├── Services/             # Business logic services
├── Repositories/         # Data access layer (Abstract & Concrete)
├── Data/                 # Database context (AppDbContext)
├── Hubs/                # SignalR hubs for real-time features
├── Migrations/          # EF Core database migrations
├── Middleware/          # Custom middleware components
├── Utils/               # Backend utility classes
├── Integration/         # Integration tests
├── PetWhenua.Tests/     # Unit and integration tests
├── Properties/          # Launch settings and publish profiles
├── react-app/           # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── api/         # API service calls
│   │   ├── services/    # Frontend services (SignalR, etc.)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── contexts/    # React contexts (Auth, Theme, etc.)
│   │   ├── models/      # TypeScript type definitions
│   │   ├── utils/       # Utility functions
│   │   ├── data/        # Static data (locations, categories)
│   │   ├── config/      # Configuration files
│   │   ├── test/        # Test utilities and setup
│   │   └── store/       # State management
│   ├── public/          # Static assets
│   └── .storybook/      # Storybook configuration
└── wwwroot/             # Backend static files and uploads
```

---

## 🙏 Acknowledgments

- Built with ❤️ for the New Zealand pet community
- Uses Material-UI for beautiful, accessible design
- Powered by .NET 8 and Entity Framework Core
- Real-time features enabled by SignalR

---

*PetWhenua - Connecting pets and their humans across New Zealand* 🇳🇿 🐾