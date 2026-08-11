# SellHealth — Multi-Tenant Clinic Website Platform

A production-ready, multi-tenant healthcare website platform built with React, TypeScript, Vite, Tailwind CSS, and Supabase. Each clinic gets its own branded website under a unique URL slug.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite 5
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router DOM 6
- **Backend / DB:** Supabase (PostgreSQL + Auth + Storage)
- **Icons:** Lucide React
- **Deployment:** Vercel (SPA)

## Features

- Multi-tenant — one codebase serves unlimited clinics via URL slugs (`/clinic-slug`)
- Dynamic theming — primary, secondary, and CTA colors set per clinic
- Dark mode — full support with system preference detection
- Admin panel — protected dashboard for all content management
- Responsive — mobile-first design with auto-hiding navbar
- Image management — focal point picker for hero/about/services images
- Section toggles — show/hide any homepage section from admin
- WhatsApp integration — quick booking and insurance checks

---

## Quick Start

### 1. Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+ (or yarn/pnpm)
- **Supabase account** — free tier works (https://supabase.com)

### 2. Clone and Install

```bash
git clone <your-repo-url>
cd SellHealth
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your Supabase dashboard under **Settings > API**.

### 4. Database Setup

The `supabase/migrations/` folder contains the full schema. Run them **in order** via the Supabase SQL Editor:

1. `schema_of_supabase.sql` — base tables (reference only, see note below)
2. `add_image_positions.sql` — image position columns
3. `add_image_zoom.sql` — image zoom columns
4. `add_focal_point_all_tables.sql` — focal point support
5. `add_service_detail_page.sql` — service detail page columns

> **Note:** `schema_of_supabase.sql` is a reference schema. The other migrations contain the actual `ALTER TABLE` statements. If starting fresh, you can run the full create statements from the reference schema first, then run the ALTER migrations.

### 5. Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `SellHealthStorage`
3. Set it to **Public**
4. Under **Configuration > Policies**, ensure public read access is enabled

### 6. Create Admin User

1. Go to **Authentication > Users** in Supabase and create a user
2. Link the user to a clinic:

```sql
INSERT INTO clinic_admins (clinic_id, user_id, role)
VALUES (
  (SELECT id FROM clinics WHERE slug = 'your-clinic-slug'),
  'the-user-uuid-from-auth',
  'admin'
);
```

### 7. Seed a Clinic

```sql
INSERT INTO clinics (name, slug, tagline, description, primary_color, secondary_color, book_button_color)
VALUES (
  'My Clinic',
  'my-clinic',
  'We care about your health',
  'A brief description of the clinic.',
  '#0ea5e9',
  '#0284c7',
  '#f97316'
);
```

### 8. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173/my-clinic` to see your site.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

## Routing

### Public Routes

| Path | Description |
|------|-------------|
| `/` | Redirects to `/medicare-clinic` |
| `/:slug` | Full landing page with all sections |
| `/:slug/services` | Services list |
| `/:slug/services/:serviceSlug` | Individual service detail |
| `/:slug/doctors` | Doctors list |
| `/:slug/appointment` | Booking form |
| `/:slug/contact` | Contact info + map |
| `/:slug/reviews` | Patient reviews |
| `/:slug/blog` | Blog tips or About Us (toggled via admin) |
| `/:slug/faq` | FAQ accordion |
| `/:slug/package-booking` | Health package booking |

### Admin Routes

| Path | Description |
|------|-------------|
| `/admin` | Login page |
| `/admin/dashboard` | Dashboard overview |
| `/admin/appointments` | Manage appointments |
| `/admin/messages` | Manage contact messages |
| `/admin/doctors` | Manage doctors |
| `/admin/services` | Manage services |
| `/admin/clinic-info` | Site content (hero, about, stats, CTA) |
| `/admin/hospital-images` | Hospital/facility images |
| `/admin/health-tips` | Blog/health tips |
| `/admin/health-packages` | Health checkup packages |
| `/admin/insurance` | Insurance providers + certifications |
| `/admin/faq` | FAQ management |
| `/admin/settings` | Clinic settings, colors, timings |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `clinics` | Clinic profiles, settings, theme colors, section toggles |
| `clinic_admins` | Admin users linked to clinics (roles: admin, staff, developer) |
| `clinic_services` | Services with fees, features, and detail page content |
| `clinic_doctors` | Doctor profiles with bios, schedules, qualifications |
| `clinic_timings` | Weekly opening hours |
| `appointments` | Patient appointment requests |
| `contact_messages` | Contact form submissions |
| `testimonials` | Patient reviews |
| `faqs` | FAQ entries |
| `blog_posts` | Health tips / blog articles |
| `insurance_providers` | Insurance companies |
| `certifications` | Accreditations and certifications |
| `health_packages` | Preventive health checkup packages |
| `architecture_images` | Hospital facility images |

---

## Multi-Tenant Architecture

Each clinic is identified by a `slug` in the URL. The `useClinicData` hook fetches all data for the current clinic based on the URL slug (localhost) or hostname (production).

**Localhost:** `http://localhost:5173/my-clinic` → looks up clinic where `slug = 'my-clinic'`

**Production:** `https://my-clinic.sellhealth.com` → looks up clinic where `website = 'my-clinic.sellhealth.com'`

---

## Theming

Colors are applied dynamically via CSS custom properties:

- `--color-primary-rgb` — primary brand color
- `--color-secondary-rgb` — secondary color
- `--color-book-btn` — Book Appointment button color

Set these per clinic in the admin **Settings** page. Presets available: Sky Blue, Emerald, Violet, Rose, Amber, Indigo, Teal, Orange.

> **Important:** When using primary colors in Tailwind gradients, do NOT use the `/opacity` modifier (e.g., `from-primary-800/80`). The primary color is defined with `rgba()` + CSS variables, so the opacity modifier conflicts. Instead, use the solid class + inline `style={{ opacity: 0.X }}`.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables in Vercel dashboard
7. Deploy

The `vercel.json` handles SPA rewrites — all routes serve `index.html`.

---

## Customization

### Adding a New Section

1. Create component in `src/components/sections/`
2. Add to `HomePage.tsx` in the appropriate position
3. Optionally add a `section_settings` toggle

### Adding a New Admin Page

1. Create page in `src/pages/admin/`
2. Add lazy import in `App.tsx`
3. Add route under the admin `<Route>` wrapper
4. Add sidebar link in `AdminLayout.tsx`

### Adding a New Database Table

1. Create migration SQL in `supabase/migrations/`
2. Add TypeScript interface in `src/types/index.ts`
3. Add fetch logic in `src/hooks/useClinicData.ts`
4. Pass data to components via props
