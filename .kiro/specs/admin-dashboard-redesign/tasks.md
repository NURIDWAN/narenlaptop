# Implementation Plan: Admin Dashboard Redesign

## Overview

Implementasi redesain dashboard admin dan modul CRUD User Management menggunakan arsitektur Laravel + Inertia.js + React yang sudah ada. Setiap task dikelompokkan berdasarkan fitur yang saling terkait (backend controller + routes + frontend page) sehingga setiap langkah menghasilkan fungsionalitas yang bisa diverifikasi.

## Tasks

- [x] 1. Create DashboardController and refactor route
  - [x] 1.1 Create `app/Http/Controllers/Admin/DashboardController.php` with `index` method
    - Move dashboard logic from closure in `routes/web.php` to a dedicated controller
    - Add new stats: products count (`Product::count()`), services count (`Service::count()`), users count (`User::count()`)
    - Add `messageTrend` data: query `ContactSubmission` grouped by date for last 7 days
    - Add `recentMessages`: 3 latest contact submissions with `id`, `name`, `message`, `created_at`, `read_at`
    - Add `unreadMessages`: count of `ContactSubmission` where `read_at` is null
    - Keep existing data: `stats`, `recentPages`, `recentArticles`
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.4, 4.1, 4.2, 4.3, 4.4_

  - [x] 1.2 Update `routes/web.php` to use DashboardController
    - Replace the `/dashboard` closure route with `Route::get('/dashboard', [DashboardController::class, 'index'])`
    - Keep middleware `['auth', 'verified']` and route name `dashboard`
    - Add `use App\Http\Controllers\Admin\DashboardController;` import
    - _Requirements: 1.5, 4.4_

- [x] 2. Redesign Dashboard.tsx frontend
  - [x] 2.1 Update `resources/js/Pages/Dashboard.tsx` with expanded stats grid and Contact Widget
    - Update `Stats` type to include `products`, `services`, `users` fields
    - Add new props: `messageTrend`, `recentMessages`, `unreadMessages`
    - Expand StatCard grid from 5 to 8 cards (add Produk, Layanan, Pengguna)
    - Add number formatting helper with Indonesian thousands separator (titik)
    - Add Contact Widget section: unread badge, 3 recent messages, "Lihat Pesan" button linking to `admin.messages.index`
    - Each message in widget links to `admin.messages.show` route
    - _Requirements: 1.1, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3_

  - [x] 2.2 Add message trend chart and expanded Quick Actions to Dashboard.tsx
    - Add simple bar chart visualization for 7-day message trend (using inline SVG or CSS bars, no external chart library needed)
    - Expand Quick Actions grid to include: Halaman, Artikel, Produk, Layanan, Media, Pengguna, Pengaturan, Lihat Website
    - Ensure responsive layout: stat cards adapt for mobile/tablet/desktop
    - _Requirements: 1.2, 1.4, 1.6_

- [x] 3. Checkpoint - Verify Dashboard redesign
  - Ensure the application builds without errors (`npm run build`)
  - Verify DashboardController returns all expected Inertia props
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create UserController, Form Requests, and routes
  - [x] 4.1 Create `app/Http/Requests/StoreUserRequest.php`
    - Rules: name required|string|max:255, email required|email|max:255|unique:users, password required|string|min:8|confirmed
    - Custom messages in Bahasa Indonesia
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 4.2 Create `app/Http/Requests/UpdateUserRequest.php`
    - Rules: name required|string|max:255, email required|email|max:255|unique:users,email,{user_id}, password nullable|string|min:8|confirmed
    - Custom messages in Bahasa Indonesia
    - _Requirements: 2.7, 2.8_

  - [x] 4.3 Create `app/Http/Controllers/Admin/UserController.php` with full CRUD
    - `index`: list users with search (name/email) and pagination (15 per page)
    - `create`: render create form
    - `store`: validate via StoreUserRequest, create user with hashed password, redirect with success flash
    - `edit`: render edit form with user data
    - `update`: validate via UpdateUserRequest, update user (skip password if empty), redirect with success flash
    - `destroy`: prevent self-deletion (compare auth user id), delete user, redirect with success flash
    - _Requirements: 2.1, 2.3, 2.6, 2.7, 2.9, 2.10, 2.11, 2.12, 2.13_

  - [x] 4.4 Add user resource route to `routes/web.php`
    - Add `Route::resource('users', UserController::class)->except(['show']);` inside the admin middleware group
    - Add the `use` import for UserController
    - _Requirements: 2.1_

- [x] 5. Create User Index page (list, search, pagination)
  - [x] 5.1 Create `resources/js/Pages/Admin/Users/Index.tsx`
    - Table with columns: Nama, Email, Bergabung (formatted date), Aksi (Edit, Hapus)
    - Search input that filters by name or email (submits as query param)
    - Pagination component (15 items per page) using Inertia pagination links
    - "Tambah Pengguna" button linking to create page
    - Delete button with confirmation dialog (`confirm()` or modal)
    - Flash message display for success/error notifications
    - Follow patterns from `Admin/Messages/Index.jsx`
    - _Requirements: 2.1, 2.9, 2.12, 2.13_

- [x] 6. Create User Create page (form + validation)
  - [x] 6.1 Create `resources/js/Pages/Admin/Users/Create.tsx`
    - Form with fields: Nama, Email, Password, Konfirmasi Password
    - Use Inertia `useForm` hook for form state and submission
    - Display validation errors per field using `usePage().props.errors`
    - Submit POSTs to `admin.users.store` route
    - Loading/processing state to prevent double-submit
    - On success: redirects to user index with flash message
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 7. Create User Edit page (form + validation)
  - [x] 7.1 Create `resources/js/Pages/Admin/Users/Edit.tsx`
    - Form with fields: Nama (pre-filled), Email (pre-filled), Password (optional), Konfirmasi Password
    - Use Inertia `useForm` hook with initial values from user prop
    - Password field empty by default — if left empty, password is not changed
    - Display validation errors per field
    - Submit PUTs to `admin.users.update` route
    - Loading/processing state to prevent double-submit
    - _Requirements: 2.6, 2.7, 2.8_

- [x] 8. Checkpoint - Verify User CRUD functionality
  - Ensure the application builds without errors (`npm run build`)
  - Verify all User CRUD routes respond correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Final integration and build verification
  - [x] 9.1 Verify full integration and fix any remaining issues
    - Ensure Dashboard stat card for "Pengguna" links to or reflects user count correctly
    - Ensure Quick Actions "Pengguna" button navigates to `/admin/users`
    - Verify Contact Widget "Lihat Pesan" button navigates to `/admin/messages`
    - Run `npm run build` to confirm frontend compiles without errors
    - Verify no PHP errors with route list check (`php artisan route:list --path=admin/users`)
    - _Requirements: 1.4, 3.2, 3.5_

## Notes

- This is a standard CRUD feature — property-based tests are skipped per project decision
- All frontend pages use TypeScript with React and Inertia.js
- Backend follows existing Laravel patterns (resource controllers, Form Requests, Inertia rendering)
- No database migrations needed — uses existing `users` table and User model
- Contact Widget reuses existing `ContactSubmission` model data
- Existing `admin.messages.index` and `admin.messages.show` routes are already available
- Checkpoints ensure incremental validation before building on previous work

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "4.1", "4.2"] },
    { "id": 1, "tasks": ["1.2", "4.3"] },
    { "id": 2, "tasks": ["2.1", "4.4"] },
    { "id": 3, "tasks": ["2.2", "5.1"] },
    { "id": 4, "tasks": ["6.1", "7.1"] },
    { "id": 5, "tasks": ["9.1"] }
  ]
}
```
