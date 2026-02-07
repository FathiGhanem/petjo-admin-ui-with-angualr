# PetJo Admin Panel

Modern Angular 21 admin panel for the PetJo pet adoption platform.

## Features

- 🎨 Clean, modern UI with PrimeNG components
- 🔐 JWT authentication with refresh tokens
- 📊 Dashboard with system statistics
- 👥 User management (activate/deactivate/delete)
- 🐾 Pet management with status tracking
- 📢 Advertisement review system
- 🏙️ City & category management
- ⭐ Hero section management
- 📱 Fully responsive design

## Tech Stack

- **Angular 21** - Latest version with standalone components
- **PrimeNG 21** - UI component library
- **TypeScript 5.9** - Type-safe development
- **RxJS** - Reactive programming
- **Chart.js** - Dashboard charts

## Architecture

```
src/
├── app/
│   ├── core/              # Core module (services, guards, interceptors)
│   │   ├── auth/          # Authentication service & guard
│   │   ├── interceptors/  # HTTP interceptors
│   │   ├── models/        # TypeScript interfaces
│   │   └── services/      # API service
│   ├── features/          # Feature modules (lazy-loaded)
│   │   ├── auth/          # Login
│   │   ├── dashboard/     # Overview stats
│   │   ├── users/         # User management
│   │   ├── pets/          # Pet management
│   │   ├── advertisements/# Ad review
│   │   ├── reports/       # Reports view
│   │   ├── categories/    # Category CRUD
│   │   ├── cities/        # City CRUD
│   │   └── heroes/        # Hero CRUD
│   ├── layout/            # Admin layout component
│   └── shared/            # Shared components
├── environments/          # Environment configs
└── styles.scss            # Global styles & design system
```

## Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`

Login with:
- Email: `admin@petjo.com`
- Password: `petjo123`

### Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## Production Deployment

### Docker Deployment

#### Build Image

```bash
docker build -t petjo-admin:latest .
```

#### Run Container

```bash
docker run -d -p 4200:80 --name petjo-admin petjo-admin:latest
```

#### Using Docker Compose

```bash
docker-compose up -d
```

### Environment Configuration

Update `src/environments/environment.prod.ts` with your production API URL:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.petjo.com/api/v1',
  tokenKey: 'petjo_admin_token'
};
```

### Build Optimization

The production build includes:
- ✅ AOT (Ahead-of-Time) compilation
- ✅ Tree-shaking
- ✅ Minification
- ✅ Code splitting
- ✅ Output hashing for cache busting

## Configuration

### API Endpoints

All API endpoints are managed in `src/app/core/services/api.service.ts`:

- **Auth:** Login, Logout, Refresh Token
- **Admin:** 28 admin endpoints covering all features

### Authentication

The app uses JWT tokens with:
- Access token (30 min expiry)
- Refresh token (7 days expiry)
- Auto-logout on 401/403
- Token stored in localStorage

## Deployment Checklist

- [ ] Update `environment.prod.ts` with production API URL
- [ ] Configure CORS on backend to allow your frontend domain
- [ ] Build production bundle: `npm run build`
- [ ] Test production build locally: `npx http-server dist/petjo-admin/browser`
- [ ] Deploy to hosting (Docker, Nginx, Cloud providers)
- [ ] Verify environment variables are correct
- [ ] Test authentication flow
- [ ] Verify all API endpoints work

## Design Patterns

- **Standalone Components:** No NgModules, modern Angular architecture
- **Signals:** Reactive state management
- **Lazy Loading:** All feature modules lazy-loaded for performance
- **Functional Guards:** Modern guard implementation
- **Interceptors:** Centralized HTTP error handling
- **Design System:** CSS custom properties for theming

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - PetJo Platform



