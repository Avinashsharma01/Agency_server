# 🏢 ParaSiteMedia — Backend API

> **Production-ready RESTful API** for an Agency Management System.  
> Built with Node.js, Express, MongoDB, JWT Authentication, Cloudinary, and Swagger.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Architecture Overview](#-architecture-overview)
- [Authentication Flow](#-authentication-flow)
- [API Response Format](#-api-response-format)
- [API Endpoints Reference](#-api-endpoints-reference)
  - [Auth](#-auth)
  - [Users](#-users)
  - [Categories](#-categories)
  - [Services](#-services)
  - [Packages](#-packages)
  - [FAQs](#-faqs)
  - [Portfolio](#-portfolio)
  - [Blogs](#-blogs)
  - [Team Members](#-team-members)
  - [Testimonials](#-testimonials)
  - [Leads](#-leads)
  - [Media Library](#-media-library)
  - [Settings](#️-settings)
- [Pagination, Search & Filtering](#-pagination-search--filtering)
- [Image Upload Guide](#-image-upload-guide)
- [RBAC & Permissions Matrix](#-rbac--permissions-matrix)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Environment Setup](#-environment-setup)
- [Swagger Docs](#-swagger-docs)
- [CORS Configuration](#-cors-configuration)

---

## 🚀 Quick Start

```bash
# 1. Navigate to the Server directory
cd Server

# 2. Install dependencies
npm install

# 3. Copy and configure environment variables
cp .env.example .env
# Edit .env with your values (MongoDB URI, JWT secrets, Cloudinary keys, SMTP, etc.)

# 4. Seed the database (roles + admin user)
npm run seed

# 5. Start the development server
npm run dev
```

The API starts at: **`http://localhost:5000`**  
Swagger docs available at: **`http://localhost:5000/api-docs`**  
Health check: **`GET http://localhost:5000/health`**

### Default Admin Credentials (after seeding)

```
Email:    admin@agency.com
Password: Admin@123456
```

---

## 🏛 Architecture Overview

```
Server/
├── src/
│   ├── config/          # Environment config (Zod-validated), DB, Cloudinary, SMTP, Redis
│   ├── constants/       # HTTP status codes, messages, roles, enums, CLOUDINARY_FOLDERS
│   ├── controllers/     # HTTP request/response handlers (thin layer)
│   ├── database/seeds/  # Idempotent seeders (roles + admin)
│   ├── emails/templates/# HTML email templates (password reset, welcome)
│   ├── helpers/         # Business utilities (cloudinary, email, password, token)
│   ├── middlewares/     # Auth, RBAC, validation, upload, rate limiter, error handler
│   ├── models/          # Mongoose schemas (13 models)
│   ├── repositories/    # Data access layer (BaseRepository + 13 module repos)
│   ├── routes/          # Express route definitions with Swagger JSDoc annotations
│   ├── services/        # Business logic layer (13 services)
│   ├── utils/           # ApiError, ApiResponse, asyncHandler, logger, pagination, etc.
│   ├── validators/      # Zod request body/params schemas
│   ├── uploads/         # Local file storage (temp files before Cloudinary upload)
│   ├── swagger.js       # OpenAPI 3.0 spec configuration
│   ├── app.js           # Express app setup (middleware, routes, Swagger UI)
│   └── server.js        # HTTP server + MongoDB connection + graceful shutdown
├── .env.example         # Environment template
└── package.json
```

**Layered Architecture**: `Route → Controller → Service → Repository → Model`

---

## 🔐 Authentication Flow

### Token Strategy

| Token | Delivery | Lifetime | Purpose |
|-------|----------|----------|---------|
| **Access Token** | JSON response body (`data.accessToken`) | **15 min** | Authorize API requests via `Authorization: Bearer <token>` |
| **Refresh Token** | HTTP-only signed cookie (`refreshToken`) | **7 days** | Silently refresh the access token |

### Login Flow (Frontend Implementation)

```javascript
// 1. Login — POST /api/v1/auth/login
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // ⚠️ REQUIRED — sends/receives cookies
  body: JSON.stringify({ email: 'admin@agency.com', password: 'Admin@123456' }),
});

const { data } = await response.json();
// data = { user: {...}, accessToken: "eyJhbG..." }

// 2. Store access token in memory (NOT localStorage for security)
let accessToken = data.accessToken;

// 3. Use access token for authenticated requests
const services = await fetch('http://localhost:5000/api/v1/services', {
  headers: { 'Authorization': `Bearer ${accessToken}` },
  credentials: 'include',
});
```

### Token Refresh Flow

```javascript
// When access token expires (401 response), silently refresh:
const refreshResponse = await fetch('http://localhost:5000/api/v1/auth/refresh-token', {
  method: 'POST',
  credentials: 'include',  // Cookie sent automatically
});

const { data } = await refreshResponse.json();
accessToken = data.accessToken;  // New access token
// New refresh token is set automatically via cookie
```

### Password Requirements

Passwords must be **at least 8 characters** and include:
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (`@$!%*?&`)

### Security Notes

- **Refresh Token Rotation**: Each refresh produces a new refresh token; old ones are invalidated.
- **Reuse Detection**: If a previously-used refresh token is reused, ALL tokens for that user are invalidated (possible token theft).
- **Max 5 Sessions**: Users can be logged in from up to 5 devices simultaneously.
- **Password Change**: Changing password invalidates ALL refresh tokens and forces re-login on all devices.
- **Forgot Password**: The API never reveals whether an email exists in the system (always returns success).

---

## 📦 API Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resources fetched successfully",
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 42,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

### Single Resource Response (no meta)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category fetched successfully",
  "data": {
    "_id": "664f...",
    "name": "Web Development",
    "slug": "web-development",
    "description": "...",
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

---

## 📡 API Endpoints Reference

> **Base URL**: `http://localhost:5000/api/v1`  
> 🔓 = Public (no auth) | 🔒 = Protected (needs `Authorization: Bearer <token>`)

---

### 🔐 Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | 🔓 | Login with email & password |
| `POST` | `/auth/register` | 🔓 | Register new admin user |
| `POST` | `/auth/logout` | 🔓* | Logout current session |
| `POST` | `/auth/logout-all` | 🔒 | Logout from ALL devices |
| `POST` | `/auth/refresh-token` | 🔓* | Refresh access token (uses cookie) |
| `POST` | `/auth/forgot-password` | 🔓 | Request password reset email |
| `POST` | `/auth/reset-password/:token` | 🔓 | Reset password with token from email |
| `PUT`  | `/auth/change-password` | 🔒 | Change password (requires current password) |

> *Uses refresh token cookie, not Bearer token

**Login Request:**
```json
{ "email": "admin@agency.com", "password": "Admin@123456" }
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Super Admin", "email": "admin@agency.com", "role": "admin" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Register Request:**
```json
{ "name": "John Admin", "email": "john@agency.com", "password": "Strong@123", "confirmPassword": "Strong@123" }
```

**Change Password Request:**
```json
{ "currentPassword": "OldPass@123", "newPassword": "NewPass@456", "confirmPassword": "NewPass@456" }
```

---

### 👤 Users

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/users/profile/me` | 🔒 | Any | Get own profile |
| `PUT`  | `/users/profile/me` | 🔒 | Any | Update own profile |
| `PUT`  | `/users/profile/avatar` | 🔒 | Any | Upload/update avatar (`multipart/form-data`, field: `image`) |
| `GET`  | `/users` | 🔒 | Admin | List all users (paginated) |
| `POST` | `/users` | 🔒 | Admin | Create a new user |
| `GET`  | `/users/:id` | 🔒 | Admin | Get user by ID |
| `PUT`  | `/users/:id` | 🔒 | Admin | Update user by ID |
| `DELETE` | `/users/:id` | 🔒 | Admin | Delete user |

**Create User Request:**
```json
{
  "name": "Jane Editor",
  "email": "jane@agency.com",
  "password": "Pass@12345",
  "role": "<role_objectId>",
  "isActive": true
}
```

---

### 📂 Categories

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/categories` | 🔓 | — | Get paginated categories |
| `GET`  | `/categories/active` | 🔓 | — | Get all active categories (unpaginated) |
| `GET`  | `/categories/slug/:slug` | 🔓 | — | Get category by slug |
| `GET`  | `/categories/:id` | 🔓 | — | Get category by ID |
| `POST` | `/categories` | 🔒 | Admin, Manager | Create category |
| `PUT`  | `/categories/:id` | 🔒 | Admin, Manager | Update category |
| `DELETE` | `/categories/:id` | 🔒 | Admin, Manager | Delete category (soft delete) |

**Create Category Request:**
```json
{
  "name": "Web Development",
  "slug": "web-development",
  "description": "Full-stack web development services",
  "icon": "fa-code",
  "order": 1,
  "isActive": true
}
```

---

### 🛠 Services

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/services` | 🔓 | — | Get paginated services |
| `GET`  | `/services/featured` | 🔓 | — | Get featured services |
| `GET`  | `/services/category/:categoryId` | 🔓 | — | Get services by category |
| `GET`  | `/services/slug/:slug` | 🔓 | — | Get service by slug |
| `GET`  | `/services/:id` | 🔓 | — | Get service by ID |
| `POST` | `/services` | 🔒 | Admin, Manager | Create service |
| `PUT`  | `/services/:id` | 🔒 | Admin, Manager | Update service |
| `DELETE` | `/services/:id` | 🔒 | Admin, Manager | Delete service (soft delete) |

**Create Service Request:**
```json
{
  "title": "Custom Website Design",
  "category": "<category_objectId>",
  "shortDescription": "Modern responsive website design",
  "fullDescription": "<rich_text_html>",
  "icon": "fa-paint-brush",
  "featuredImage": { "publicId": "agency-cms/services/abc123", "url": "https://res.cloudinary.com/..." },
  "isFeatured": true,
  "isActive": true,
  "order": 1,
  "tags": ["web", "design", "responsive"],
  "metaTitle": "Custom Website Design | Agency",
  "metaDescription": "Professional custom website design services"
}
```

---

### 💰 Packages

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/packages` | 🔓 | — | Get paginated packages |
| `GET`  | `/packages/service/:serviceId` | 🔓 | — | Get packages for a service |
| `GET`  | `/packages/:id` | 🔓 | — | Get package by ID |
| `POST` | `/packages` | 🔒 | Admin, Manager | Create package |
| `PUT`  | `/packages/:id` | 🔒 | Admin, Manager | Update package |
| `DELETE` | `/packages/:id` | 🔒 | Admin, Manager | Delete package (soft delete) |

**Create Package Request:**
```json
{
  "name": "Professional Plan",
  "service": "<service_objectId>",
  "packageType": "premium",
  "price": 1499,
  "currency": "USD",
  "billingPeriod": "one_time",
  "description": "Complete professional package",
  "features": [
    { "text": "Custom Design", "isIncluded": true },
    { "text": "SEO Optimization", "isIncluded": true },
    { "text": "24/7 Support", "isIncluded": false }
  ],
  "isPopular": true,
  "isActive": true,
  "order": 2
}
```

**Enums:**
- `packageType`: `basic` | `standard` | `premium` | `custom`
- `billingPeriod`: `one_time` | `monthly` | `yearly`

---

### ❓ FAQs

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/faqs` | 🔓 | — | Get paginated FAQs |
| `GET`  | `/faqs/global` | 🔓 | — | Get global (site-wide) FAQs |
| `GET`  | `/faqs/service/:serviceId` | 🔓 | — | Get FAQs for a specific service |
| `GET`  | `/faqs/:id` | 🔓 | — | Get FAQ by ID |
| `POST` | `/faqs` | 🔒 | Admin, Manager | Create FAQ |
| `PUT`  | `/faqs/:id` | 🔒 | Admin, Manager | Update FAQ |
| `DELETE` | `/faqs/:id` | 🔒 | Admin, Manager | Delete FAQ (soft delete) |

**Create FAQ Request:**
```json
{
  "question": "What is your typical project turnaround time?",
  "answer": "Most projects are completed within 4-6 weeks...",
  "service": "<service_objectId>",
  "isGlobal": false,
  "category": "pricing",
  "order": 1,
  "isActive": true
}
```

> Set `isGlobal: true` and omit `service` for site-wide FAQs.

---

### 🎨 Portfolio

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/portfolio` | 🔓 | — | Get paginated portfolio items |
| `GET`  | `/portfolio/featured` | 🔓 | — | Get featured projects |
| `GET`  | `/portfolio/slug/:slug` | 🔓 | — | Get project by slug |
| `GET`  | `/portfolio/:id` | 🔓 | — | Get project by ID |
| `POST` | `/portfolio` | 🔒 | Admin, Manager, Editor | Create portfolio item |
| `PUT`  | `/portfolio/:id` | 🔒 | Admin, Manager, Editor | Update portfolio item |
| `DELETE` | `/portfolio/:id` | 🔒 | Admin, Manager, Editor | Delete portfolio item (soft delete) |

**Create Portfolio Request:**
```json
{
  "title": "E-Commerce Redesign",
  "category": "<category_objectId>",
  "service": "<service_objectId>",
  "client": "TechCorp Inc.",
  "shortDescription": "Complete e-commerce platform redesign",
  "fullDescription": "<rich_text_html>",
  "featuredImage": { "publicId": "...", "url": "https://..." },
  "galleryImages": [
    { "publicId": "...", "url": "https://...", "caption": "Homepage", "order": 0 },
    { "publicId": "...", "url": "https://...", "caption": "Product Page", "order": 1 }
  ],
  "technologies": ["React", "Node.js", "MongoDB"],
  "projectUrl": "https://client-site.com",
  "githubUrl": "https://github.com/...",
  "completionDate": "2026-03-15",
  "isFeatured": true,
  "isActive": true,
  "order": 1,
  "metaTitle": "E-Commerce Redesign | Portfolio",
  "metaDescription": "..."
}
```

**Query Filters:**
- `?category=<objectId>` — Filter by category
- `?service=<objectId>` — Filter by service
- `?isFeatured=true` — Only featured items
- `?isActive=true` — Only active items

---

### 📝 Blogs

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/blogs` | 🔓 | — | Get paginated published blogs |
| `GET`  | `/blogs/slug/:slug` | 🔓 | — | Get blog by slug |
| `GET`  | `/blogs/:id` | 🔓 | — | Get blog by ID |
| `GET`  | `/blogs/admin/all` | 🔒 | Admin, Manager, Editor | Get ALL blogs (incl. drafts/archived) |
| `POST` | `/blogs` | 🔒 | Admin, Manager, Editor | Create blog post |
| `PUT`  | `/blogs/:id` | 🔒 | Admin, Manager, Editor | Update blog post |
| `DELETE` | `/blogs/:id` | 🔒 | Admin, Manager, Editor | Delete blog (soft delete) |

**Create Blog Request:**
```json
{
  "title": "Top 10 Web Design Trends in 2026",
  "content": "<rich_text_html>",
  "excerpt": "Discover the latest trends shaping modern web design...",
  "category": "<category_objectId>",
  "featuredImage": { "publicId": "...", "url": "https://..." },
  "tags": ["design", "trends", "web"],
  "status": "draft",
  "metaTitle": "Top 10 Web Design Trends",
  "metaDescription": "..."
}
```

**Status Enum:** `draft` | `published` | `archived`

> **Auto-calculated fields:** `readingTime` (words/200 WPM), `publishedAt` (set on first publish), `viewsCount` (incremented on public reads), `author` (set from authenticated user).

---

### 👥 Team Members

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/team` | 🔓 | — | Get paginated team members |
| `GET`  | `/team/active` | 🔓 | — | Get all active members (unpaginated) |
| `GET`  | `/team/:id` | 🔓 | — | Get member by ID |
| `POST` | `/team` | 🔒 | Admin, Manager | Create team member |
| `PUT`  | `/team/:id` | 🔒 | Admin, Manager | Update team member |
| `DELETE` | `/team/:id` | 🔒 | Admin, Manager | Delete team member (soft delete) |

**Create Team Member Request:**
```json
{
  "name": "Jane Doe",
  "designation": "Senior Designer",
  "bio": "10+ years of experience in UI/UX design...",
  "avatar": { "publicId": "...", "url": "https://..." },
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/janedoe",
    "twitter": "https://twitter.com/janedoe",
    "github": "https://github.com/janedoe",
    "instagram": "",
    "website": "https://janedoe.com"
  },
  "email": "jane@agency.com",
  "phone": "+1234567890",
  "order": 1,
  "isActive": true
}
```

---

### ⭐ Testimonials

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/testimonials` | 🔓 | — | Get paginated testimonials |
| `GET`  | `/testimonials/featured` | 🔓 | — | Get featured testimonials |
| `GET`  | `/testimonials/:id` | 🔓 | — | Get testimonial by ID |
| `POST` | `/testimonials` | 🔒 | Admin, Manager | Create testimonial |
| `PUT`  | `/testimonials/:id` | 🔒 | Admin, Manager | Update testimonial |
| `DELETE` | `/testimonials/:id` | 🔒 | Admin, Manager | Delete testimonial (soft delete) |

**Create Testimonial Request:**
```json
{
  "clientName": "John Smith",
  "clientDesignation": "CTO",
  "clientCompany": "TechCorp",
  "clientAvatar": { "publicId": "...", "url": "https://..." },
  "content": "Working with this agency was an incredible experience...",
  "rating": 5,
  "service": "<service_objectId>",
  "isFeatured": true,
  "isActive": true,
  "order": 1
}
```

---

### 📨 Leads

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `POST` | `/leads` | 🔓 | — | **Submit contact form** (public) |
| `GET`  | `/leads` | 🔒 | Admin, Manager | List leads (paginated pipeline) |
| `GET`  | `/leads/:id` | 🔒 | Admin, Manager | Get lead details |
| `PUT`  | `/leads/:id` | 🔒 | Admin, Manager | Update lead |
| `PUT`  | `/leads/:id/status` | 🔒 | Admin, Manager | Update pipeline status |
| `PUT`  | `/leads/:id/assign` | 🔒 | Admin, Manager | Assign lead to staff |
| `POST` | `/leads/:id/notes` | 🔒 | Admin, Manager | Add internal note |
| `DELETE` | `/leads/:id` | 🔒 | Admin, Manager | Delete lead (soft delete) |

**Public Contact Form (Create Lead):**
```json
{
  "name": "Alice Johnson",
  "email": "alice@company.com",
  "phone": "+1987654321",
  "company": "StartupXYZ",
  "service": "<service_objectId>",
  "subject": "Website Redesign Inquiry",
  "message": "We are looking to redesign our corporate website...",
  "budget": "$5,000 - $10,000"
}
```

**Update Lead Status:**
```json
{ "status": "contacted" }
```
Status Enum: `new` → `contacted` → `qualified` → `proposal_sent` → `converted` | `rejected`

**Assign Lead:**
```json
{ "assignedTo": "<user_objectId>" }
```

**Add Internal Note:**
```json
{ "content": "Discussed requirements via phone call. Client wants React frontend." }
```

**Query Filters:**
- `?status=new` — Filter by pipeline status
- `?service=<objectId>` — Filter by service
- `?assignedTo=<objectId>` — Filter by assigned staff

---

### 📁 Media Library

> ⚠️ **All media routes are protected** — requires authentication.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `POST` | `/media` | 🔒 | Admin, Manager, Editor | Upload single image |
| `POST` | `/media/multiple` | 🔒 | Admin, Manager, Editor | Upload multiple images (max 10) |
| `GET`  | `/media` | 🔒 | Admin, Manager, Editor | Browse media library (paginated) |
| `GET`  | `/media/:id` | 🔒 | Admin, Manager, Editor | Get media by ID |
| `PUT`  | `/media/:id` | 🔒 | Admin, Manager, Editor | Update metadata (alt, caption, folder) |
| `DELETE` | `/media/:id` | 🔒 | Admin, Manager, Editor | Delete from Cloudinary + soft delete |

**Upload Single Image:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('folder', 'banners');
formData.append('alt', 'Homepage banner');
formData.append('caption', 'Summer promotion banner 2026');

await fetch('/api/v1/media', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  credentials: 'include',
  body: formData,
});
```

**Upload Multiple Images:**
```javascript
const formData = new FormData();
files.forEach(file => formData.append('images', file));

await fetch('/api/v1/media/multiple', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  credentials: 'include',
  body: formData,
});
```

**Query Filters:**
- `?folder=banners` — Filter by folder
- `?mimeType=image` — Filter by MIME type (partial match)
- `?uploadedBy=<objectId>` — Filter by uploader

**Allowed File Types:**
- Images: `JPEG`, `JPG`, `PNG`, `GIF`, `WebP`, `SVG` (max 5MB)
- Videos: `MP4`, `WebM`, `OGG`, `QuickTime` (max 100MB)

---

### ⚙️ Settings

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET`  | `/settings` | 🔓 | — | Get website settings (frontend needs this) |
| `PUT`  | `/settings` | 🔒 | Admin | Update settings (JSON) |
| `PUT`  | `/settings/logo` | 🔒 | Admin | Upload/replace site logo |
| `PUT`  | `/settings/favicon` | 🔒 | Admin | Upload/replace favicon |
| `PUT`  | `/settings/og-image` | 🔒 | Admin | Upload/replace SEO Open Graph image |

**Update Settings Request:**
```json
{
  "siteName": "My Agency",
  "siteTagline": "We Build Digital Experiences",
  "contactEmail": "hello@myagency.com",
  "contactPhone": "+1 (555) 123-4567",
  "contactAddress": "123 Agency Street, Suite 100, New York, NY",
  "socialLinks": {
    "facebook": "https://facebook.com/myagency",
    "twitter": "https://twitter.com/myagency",
    "linkedin": "https://linkedin.com/company/myagency",
    "instagram": "https://instagram.com/myagency",
    "youtube": "",
    "github": "https://github.com/myagency"
  },
  "seo": {
    "metaTitle": "My Agency — Web Design & Development",
    "metaDescription": "Award-winning digital agency specializing in web design..."
  },
  "footerText": "© 2026 My Agency. All rights reserved.",
  "maintenanceMode": false,
  "analytics": {
    "googleAnalyticsId": "G-XXXXXXXXXX",
    "facebookPixelId": "1234567890"
  }
}
```

**Upload Logo/Favicon/OG Image:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

await fetch('/api/v1/settings/logo', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  credentials: 'include',
  body: formData,
});
```

> **Frontend usage**: Call `GET /settings` on app init to load site name, logo, contact info, social links, SEO metadata, and analytics IDs.

---

## 🔍 Pagination, Search & Filtering

All paginated endpoints support these query parameters:

| Parameter | Type | Default | Example | Description |
|-----------|------|---------|---------|-------------|
| `page` | number | `1` | `?page=2` | Page number |
| `limit` | number | `10` | `?limit=25` | Items per page (max: 100) |
| `search` | string | — | `?search=web design` | Full-text search on relevant fields |
| `sort` | string | `-createdAt` | `?sort=-createdAt` or `?sort=order` | Sort field. Prefix with `-` for descending |
| `isActive` | boolean | — | `?isActive=true` | Filter by active status |
| `isFeatured` | boolean | — | `?isFeatured=true` | Filter by featured flag |

**Example: Paginated request**
```
GET /api/v1/services?page=1&limit=6&search=design&sort=-isFeatured,order&isActive=true
```

**Pagination response meta:**
```json
{
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 6,
      "totalItems": 18,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 🖼 Image Upload Guide

### Strategy

1. **Upload images to Cloudinary** via `POST /api/v1/media` (returns `publicId` + `url`)
2. **Reference the image** in create/update payloads as `{ publicId, url }`

### Frontend Workflow Example

```javascript
// Step 1: Upload image to media library
const formData = new FormData();
formData.append('image', file);
formData.append('folder', 'services');

const uploadRes = await api.post('/media', formData);
const { publicId, url } = uploadRes.data.data;

// Step 2: Use the publicId and url in a service creation
await api.post('/services', {
  title: 'Web Design',
  category: categoryId,
  featuredImage: { publicId, url },
  // ...other fields
});
```

### Image Fields by Module

| Module | Image Fields | Type |
|--------|-------------|------|
| Service | `featuredImage` | `{ publicId, url }` |
| Portfolio | `featuredImage`, `galleryImages[]` | Object / Array of objects |
| Blog | `featuredImage` | `{ publicId, url }` |
| Team Member | `avatar` | `{ publicId, url }` |
| Testimonial | `clientAvatar` | `{ publicId, url }` |
| Settings | `siteLogo`, `favicon`, `seo.ogImage` | Upload endpoints |
| User | `avatar` | Upload via `PUT /users/profile/avatar` |
| Media | Direct upload | Upload via `POST /media` |

---

## 🛡 RBAC & Permissions Matrix

### Roles (highest to lowest privilege)

| Role | Level | Description |
|------|-------|-------------|
| `admin` | 3 | Full access to everything |
| `manager` | 2 | Content + lead management |
| `editor` | 1 | Content creation only |

### Permissions by Module

| Module | Public Read | Editor | Manager | Admin |
|--------|-----------|--------|---------|-------|
| Categories | ✅ | ❌ | ✅ CRUD | ✅ CRUD |
| Services | ✅ | ❌ | ✅ CRUD | ✅ CRUD |
| Packages | ✅ | ❌ | ✅ CRUD | ✅ CRUD |
| FAQs | ✅ | ❌ | ✅ CRUD | ✅ CRUD |
| Portfolio | ✅ | ✅ CRUD | ✅ CRUD | ✅ CRUD |
| Blogs | ✅ (published) | ✅ CRUD | ✅ CRUD | ✅ CRUD |
| Team | ✅ | ❌ | ✅ CRUD | ✅ CRUD |
| Testimonials | ✅ | ❌ | ✅ CRUD | ✅ CRUD |
| Leads | Submit only | ❌ | ✅ Full | ✅ Full |
| Media | ❌ | ✅ CRUD | ✅ CRUD | ✅ CRUD |
| Settings | ✅ (read) | ❌ | ❌ | ✅ CRUD |
| Users | Profile only | Profile only | Profile only | ✅ Full |

---

## ❌ Error Handling

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| `200` | OK | Successful read/update/delete |
| `201` | Created | Successful creation |
| `400` | Bad Request | Validation error, invalid input |
| `401` | Unauthorized | Missing/expired/invalid access token |
| `403` | Forbidden | Valid token but insufficient role permissions |
| `404` | Not Found | Resource doesn't exist or has been soft-deleted |
| `409` | Conflict | Duplicate (e.g., email already exists, slug conflict) |
| `422` | Unprocessable Entity | Validation error (Zod schema) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

### Handling 401 on Frontend

```javascript
// Axios interceptor example
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await api.post('/auth/refresh-token');
        accessToken = data.data.accessToken;
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return api(error.config);
      } catch {
        // Refresh failed → redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## ⏱ Rate Limiting

| Limiter | Window | Max Requests | Applies To |
|---------|--------|--------------|------------|
| **API General** | 15 min | 100 | All `/api/v1/*` endpoints |
| **Auth** | 15 min | 10 | Login, Register |
| **Password Reset** | 1 hour | 5 | Forgot password, Reset password |

When rate limited, the API returns:
```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests. Please try again later."
}
```

Standard rate limit headers are included:
- `RateLimit-Limit`
- `RateLimit-Remaining`
- `RateLimit-Reset`

---

## 🔧 Environment Setup

Copy `.env.example` to `.env` and fill in:

```bash
# Application
NODE_ENV=development
PORT=5000
API_VERSION=v1

# MongoDB
MONGODB_URI=mongodb://localhost:27017/agency_cms

# JWT (generate strong secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
JWT_ACCESS_SECRET=<min_32_chars>
JWT_REFRESH_SECRET=<min_32_chars>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cookie
COOKIE_SECRET=<min_32_chars>

# CORS (your frontend URL)
CORS_ORIGIN=http://localhost:3000

# Cloudinary (get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (Gmail example — use App Password, not account password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM_NAME=ParaSiteMedia
SMTP_FROM_EMAIL=noreply@youragency.com

# Redis (optional — app works without it)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Seed Data
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@agency.com
ADMIN_PASSWORD=Admin@123456

# Frontend URL (used in password reset email links)
FRONTEND_URL=http://localhost:3000
```

---

## 📖 Swagger Docs

Interactive API documentation is auto-generated from route annotations.

- **Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Raw JSON Spec**: [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)

Features:
- Try out endpoints directly from the browser
- Authorize with your JWT token (click "Authorize" button)
- View request/response schemas for every endpoint
- Download the OpenAPI spec for client SDK generation

---

## 🌐 CORS Configuration

The backend is configured to accept requests from `CORS_ORIGIN` (default: `http://localhost:3000`).

**Frontend requirements:**
- Always send `credentials: 'include'` with `fetch()` or set `withCredentials: true` in Axios
- This is required for the HTTP-only refresh token cookie to be sent/received

```javascript
// Axios global config
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,  // ⚠️ REQUIRED for cookie-based auth
  headers: { 'Content-Type': 'application/json' },
});
```

---

## 📜 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `node src/server.js` | Start production server |
| `npm run dev` | `nodemon src/server.js` | Start development server (auto-reload) |
| `npm run seed` | Runs roleSeeder + adminSeeder | Seeds roles and admin user |
| `npm run seed:roles` | Runs roleSeeder only | Seeds role documents |
| `npm run seed:admin` | Runs adminSeeder only | Seeds admin user |
| `npm run lint` | `eslint src/` | Lint source code |
| `npm run lint:fix` | `eslint src/ --fix` | Auto-fix lint issues |

---

## 📌 Quick Integration Checklist for Frontend

- [ ] Set up Axios/Fetch with `credentials: 'include'` / `withCredentials: true`
- [ ] Implement login → store access token in memory (not localStorage)
- [ ] Set up 401 interceptor → auto-refresh token → retry failed request
- [ ] Call `GET /settings` on app init for site metadata, logo, social links
- [ ] Call `GET /categories/active` for navigation menu items
- [ ] Call `GET /services/featured` for homepage service highlights
- [ ] Call `GET /portfolio/featured` for homepage portfolio showcase
- [ ] Call `GET /testimonials/featured` for homepage testimonials carousel
- [ ] Call `GET /team/active` for team section
- [ ] Call `GET /faqs/global` for FAQ section
- [ ] Implement contact form → `POST /leads` (public, no auth needed)
- [ ] Use Media Library endpoints for CMS image picker in admin dashboard
- [ ] Handle pagination meta for infinite scroll / page navigation
- [ ] Parse `readingTime` field for blog post reading estimates

---

<p align="center">
  <strong>Built with ❤️ for production-grade agency management</strong><br>
  <sub>Node.js • Express • MongoDB • JWT • Cloudinary • Swagger</sub>
</p>
