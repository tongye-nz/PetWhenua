# React Component Restructuring Plan

## Current Issues
1. Duplicate directories (`atoms/` vs `ui/`, `organisms/` vs `layout/`)
2. Inconsistent component usage patterns
3. Mixed atomic design implementation
4. LocationSelector in multiple directories

## Recommended New Structure

```
src/
├── components/
│   ├── ui/                          # Design System - Basic UI Components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Text/
│   │   ├── LoadingSpinner/
│   │   ├── Logo/
│   │   ├── Avatar/
│   │   ├── Card/
│   │   └── index.ts
│   ├── forms/                       # Form Components
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   ├── UserProfileForm/
│   │   ├── LocationSelector/
│   │   └── index.ts
│   ├── layout/                      # Layout Components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Navigation/
│   │   ├── Sidebar/
│   │   ├── PageLayout/
│   │   └── index.ts
│   ├── features/                    # Feature-specific Components
│   │   ├── auth/
│   │   │   ├── AuthTemplate/
│   │   │   ├── AuthHeader/
│   │   │   ├── AuthFooter/
│   │   │   └── index.ts
│   │   ├── profile/
│   │   │   ├── ProfileHeader/
│   │   │   ├── ProfilePicture/
│   │   │   ├── ProfileStats/
│   │   │   └── index.ts
│   │   ├── pets/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── common/                      # Cross-cutting Components
│   │   ├── ProtectedRoute/
│   │   ├── ErrorBoundary/
│   │   ├── Layout/
│   │   └── index.ts
│   └── index.ts
```

## Migration Steps

### Phase 1: Consolidate Basic Components
1. Remove duplicate `ui/` directory
2. Keep only `atoms/` for basic components, rename to `ui/`
3. Move all basic UI components to `ui/`

### Phase 2: Reorganize by Purpose
1. Move form-related components to `forms/`
2. Move layout components to `layout/`
3. Organize feature-specific components under `features/`

### Phase 3: Update Imports
1. Update all import statements across the app
2. Ensure consistent usage of design system components
3. Remove direct Material-UI imports from pages

### Phase 4: Establish Component Guidelines
1. Create component development guidelines
2. Implement prop standardization
3. Add component documentation

## Benefits of New Structure

1. **Clear Separation of Concerns**: Each directory has a specific purpose
2. **Feature-based Organization**: Related components are grouped together
3. **Scalability**: Easy to add new features and components
4. **Maintainability**: Clear hierarchy and no duplication
5. **Developer Experience**: Intuitive component discovery

## Component Usage Rules

1. **Pages should only import from `components/index.ts`**
2. **No direct Material-UI imports in pages** (use design system)
3. **Feature components can use ui components**
4. **Layout components are for structural elements**
5. **Forms handle all form-related logic**

## Implementation Priority

1. High: Remove duplicates and consolidate
2. Medium: Reorganize by purpose
3. Low: Update documentation and guidelines 