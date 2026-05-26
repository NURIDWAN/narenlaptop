# Product Requirements Document (PRD)
## Website Company Profile — Laravel + Inertia + React
### Referensi: fentacom.id | Versi 1.0 | Mei 2026

---

## 1. Overview

### 1.1 Latar Belakang

Website ini dibangun sebagai platform company profile modern untuk bisnis jasa (service laptop, gadget, dll) seperti **fentacom.id**. Tujuan utama adalah menggantikan WordPress/Elementor dengan stack yang lebih cepat, lebih SEO-friendly, dan mudah dikelola oleh non-developer melalui admin panel.

### 1.2 Tujuan Produk

- Memberikan pengalaman website yang cepat dan modern (SPA + SSR)
- Memudahkan admin membangun halaman tanpa coding (Page/Section Builder)
- Meningkatkan traffic organik lewat artikel blog dengan fitur SEO otomatis
- Menonjolkan perbandingan visual layanan/produk dengan Image Compare
- Mengelola semua konten dari satu admin panel terpusat

### 1.3 Target Pengguna

| Persona | Deskripsi |
|--------|-----------|
| Admin / Owner | Mengelola konten, halaman, artikel, gambar, dan pengaturan SEO |
| Teknisi/Staff | Mengupdate status layanan atau konten tertentu |
| Pengunjung | Mencari informasi layanan, membaca artikel, menghubungi bisnis |

---

## 2. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 11 (REST API + SSR) |
| Frontend | React 18 + Inertia.js |
| Styling | Tailwind CSS v4 |
| Database | MySQL 8 / PostgreSQL |
| Storage | Laravel Storage (local/S3) |
| Cache | Redis |
| SEO | Inertia SSR + Laravel Meta Tags |
| Queue | Laravel Horizon (untuk generate SEO otomatis) |
| Search | Laravel Scout + Meilisearch (opsional) |

---

## 3. Fitur Utama

### 3.1 🧱 Unlimited Page & Section Builder

#### Deskripsi
Admin dapat membuat halaman baru tanpa batas, dan setiap halaman terdiri dari section-section yang dapat disusun secara drag-and-drop.

#### User Stories
- Sebagai admin, saya dapat membuat halaman baru dengan custom slug dan meta SEO
- Sebagai admin, saya dapat menambahkan, menghapus, dan mengurutkan section di dalam satu halaman
- Sebagai admin, saya dapat memilih jenis section dari library template section
- Sebagai admin, saya dapat mengatur konten teks, gambar, warna, dan layout setiap section

#### Section Types (Library)

| Tipe Section | Deskripsi |
|---|---|
| `hero` | Banner utama dengan judul, subjudul, CTA button, background image |
| `about` | Tentang bisnis dengan teks dan gambar |
| `services` | Grid/list layanan dengan ikon dan deskripsi |
| `stats` | Angka statistik (counter animasi) |
| `testimonials` | Carousel testimoni pelanggan |
| `gallery` | Grid galeri foto |
| `image_compare` | Perbandingan gambar before/after (slider) |
| `cta` | Call-to-action dengan teks dan tombol |
| `faq` | Accordion FAQ |
| `contact` | Form kontak + peta / embed Google Maps |
| `blog_list` | Tampilkan artikel terbaru |
| `custom_html` | Input HTML/CSS kustom bebas |
| `pricing` | Tabel harga layanan |
| `team` | Profil tim/karyawan |

#### Data Model

```
pages
  - id
  - title
  - slug (unique)
  - status (draft | published)
  - meta_title
  - meta_description
  - meta_og_image
  - created_at, updated_at

page_sections
  - id
  - page_id (FK)
  - type (hero | about | services | ...)
  - order (integer, untuk sorting)
  - settings (JSON — konten & konfigurasi section)
  - is_visible (boolean)
  - created_at, updated_at
```

#### Field `settings` (JSON) per Section Type

Contoh untuk `hero`:
```json
{
  "title": "Service Laptop Terbaik di Depok",
  "subtitle": "Kami siap menjadi solusi IT Anda",
  "cta_text": "Hubungi Kami",
  "cta_url": "/kontak",
  "background_image": "uploads/hero-bg.jpg",
  "overlay_opacity": 0.5
}
```

#### Acceptance Criteria
- [x] Admin bisa membuat halaman baru dari `/admin/pages/create`
- [x] Halaman bisa ditambah section minimal 1, maksimal tidak terbatas
- [x] Section bisa di-drag untuk reorder (menggunakan `react-beautiful-dnd` atau `@dnd-kit`)
- [x] Perubahan section di-save ke DB dalam format JSON
- [x] Preview halaman real-time sebelum publish
- [x] Halaman yang dipublish langsung accessible di `/[slug]`
- [x] Section bisa disembunyikan tanpa dihapus (toggle `is_visible`)

---

### 3.2 📝 Article + SEO Otomatis

#### Deskripsi
Modul blog dengan fitur auto-generate meta title, meta description, og:image, schema markup, dan saran keyword berdasarkan konten artikel menggunakan AI (Claude API).

#### User Stories
- Sebagai admin, saya dapat menulis artikel dengan rich text editor
- Sebagai admin, SEO fields (meta title, description) ter-generate otomatis saat artikel disimpan
- Sebagai admin, saya dapat melihat SEO score dan saran perbaikan
- Sebagai pengunjung, artikel saya dapat ditemukan di Google dengan tampilan rich snippet

#### Data Model

```
articles
  - id
  - title
  - slug (unique, auto-generate dari title)
  - excerpt
  - content (longtext — HTML dari editor)
  - thumbnail
  - category_id (FK)
  - author_id (FK → users)
  - status (draft | published | scheduled)
  - published_at
  - meta_title (auto-generated jika kosong)
  - meta_description (auto-generated jika kosong)
  - meta_keywords (array JSON)
  - og_image
  - schema_type (Article | HowTo | FAQPage)
  - reading_time (menit, auto-hitung)
  - view_count
  - created_at, updated_at

article_categories
  - id
  - name
  - slug
  - description
  - meta_title, meta_description
```

#### Fitur SEO Otomatis

**Auto-generate via Laravel Job (Queue):**

Saat artikel disimpan (event: `ArticleSaved`), sistem dispatch Job:

```
GenerateArticleSEOJob
  → Kirim konten artikel ke Claude API
  → Generate: meta_title, meta_description, keywords, og_image_suggestion
  → Update record artikel
```

**Output yang di-generate:**
- `meta_title` — 50–60 karakter, mengandung keyword utama
- `meta_description` — 150–160 karakter, mengandung CTA
- `meta_keywords` — 5–10 keyword relevan
- `schema_markup` — JSON-LD (Article, HowTo, FAQ tergantung isi)
- `reading_time` — hitung dari jumlah kata (avg 200 kata/menit)
- `excerpt` — ringkasan 1 paragraf jika belum diisi

**SEO Score Dashboard:**
Tampilkan score 0–100 dengan saran:
- Panjang judul ✅/❌
- Meta description ada ✅/❌
- Keyword muncul di H1 ✅/❌
- Internal link minimal 1 ✅/❌
- Alt text pada semua gambar ✅/❌
- Readability score (Flesch–Kincaid) ✅/❌

**Sitemap & Robots:**
- `/sitemap.xml` auto-generate dari semua halaman + artikel published
- `/robots.txt` configurable dari admin panel

#### Rich Text Editor
Gunakan **TipTap** (headless editor untuk React) dengan extensions:
- Bold, Italic, Underline, Strikethrough
- Heading H1–H4
- Bullet list, Ordered list
- Image upload (drag & drop ke storage)
- Link (dengan rel nofollow toggle)
- Table
- Code block
- YouTube embed

#### Acceptance Criteria
- [x] Artikel bisa ditulis dengan rich text editor
- [x] Meta SEO ter-generate otomatis dalam < 10 detik setelah save (via queue)
- [x] Admin bisa override hasil generate
- [x] Artikel tampil dengan schema markup JSON-LD di `<head>`
- [x] Sitemap otomatis update saat ada artikel baru dipublish
- [x] URL artikel: `/blog/[slug]`
- [x] Kategori artikel: `/blog/kategori/[slug]`

---

### 3.3 🖼️ Image Compare (Before/After Slider)

#### Deskripsi
Section khusus untuk menampilkan perbandingan dua gambar (before & after) menggunakan slider interaktif. Berguna untuk menampilkan hasil service (laptop rusak vs sudah diperbaiki, dll).

#### User Stories
- Sebagai admin, saya dapat menambahkan section Image Compare di halaman manapun
- Sebagai admin, saya upload dua gambar (before & after) beserta label
- Sebagai pengunjung, saya bisa drag/geser slider untuk membandingkan kedua gambar
- Sebagai pengunjung, fitur ini bisa dinikmati di mobile dengan touch support

#### Konfigurasi Section (JSON settings)

```json
{
  "title": "Sebelum & Sesudah Service",
  "subtitle": "Lihat perbedaan nyata hasil kerja kami",
  "before_image": "uploads/compare/before-laptop.jpg",
  "after_image": "uploads/compare/after-laptop.jpg",
  "before_label": "Sebelum Service",
  "after_label": "Sesudah Service",
  "initial_position": 50,
  "orientation": "horizontal"
}
```

#### Implementasi Frontend

Gunakan library **`react-compare-slider`** (lightweight, touch-friendly):

```jsx
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

<ReactCompareSlider
  itemOne={<ReactCompareSliderImage src={before_image} alt={before_label} />}
  itemTwo={<ReactCompareSliderImage src={after_image} alt={after_label} />}
  position={initial_position}
/>
```

**Fitur tambahan:**
- Label overlay di kiri (Before) dan kanan (After)
- Handle custom styling sesuai brand color
- Lazy loading gambar
- Support multiple compare dalam satu halaman (array)

#### Data Model
Image Compare dikelola sebagai bagian dari `page_sections.settings` (JSON), tidak perlu tabel terpisah. Jika dibutuhkan modul standalone:

```
image_compares
  - id
  - title
  - before_image
  - after_image
  - before_label
  - after_label
  - description
  - is_active
```

#### Acceptance Criteria
- [x] Slider bisa digeser dengan mouse (desktop) dan touch (mobile)
- [x] Gambar before & after bisa diupload dari admin panel
- [x] Section Image Compare bisa ditambahkan ke halaman manapun via Page Builder
- [x] Mendukung multiple instance Image Compare dalam satu halaman
- [x] Gambar lazy loaded untuk performa

---

## 4. Fitur Pendukung

### 4.1 Admin Panel

Framework: **Laravel Breeze** (Inertia + React) atau build custom

**Menu Admin:**
- Dashboard (statistik: page views, artikel, form submission)
- Halaman (Page Builder)
- Artikel (Blog)
- Media Library (upload & kelola gambar)
- Menu Navigasi (header & footer)
- Pengaturan Global (site name, logo, warna, social media, WhatsApp number)
- SEO Global (Google Analytics ID, Google Tag Manager, robots.txt)
- Pesan Masuk (dari form kontak)
- Pengguna & Role

### 4.2 Global Settings

```
settings (key-value store)
  - site_name
  - site_logo
  - favicon
  - primary_color
  - whatsapp_number
  - whatsapp_message_default
  - email
  - address
  - google_maps_embed
  - social_instagram, social_facebook, social_tiktok, social_youtube
  - ga_tracking_id
  - gtm_id
  - header_scripts (untuk custom script di <head>)
  - footer_scripts
```

### 4.3 Media Library

- Upload gambar (jpg, png, webp, gif)
- Auto-resize/compress saat upload (via Laravel Intervention Image)
- Generate WebP version otomatis
- Tampilan grid dengan search dan filter
- Drag & drop upload
- Soft delete (recycle bin)

### 4.4 Navigasi Dinamis

Admin bisa atur menu header dan footer dari panel:
- Tambah/hapus/reorder menu item
- Mega menu (dropdown bertingkat)
- Link internal (pilih dari daftar halaman) atau eksternal
- Badge/label (e.g., "Baru", "Promo")

### 4.5 Form Kontak + WhatsApp

- Form kontak: Nama, Email, No. HP, Pesan
- Submit → simpan ke DB + kirim notifikasi email ke admin
- Tombol floating WhatsApp (sticky, configurable teks default)
- Integrasi opsional: Fonnte/WA Gateway untuk notifikasi WA

---

## 5. Arsitektur Teknis

### 5.1 Struktur Direktori Laravel

```
app/
├── Http/Controllers/
│   ├── Admin/
│   │   ├── PageController.php
│   │   ├── ArticleController.php
│   │   ├── MediaController.php
│   │   └── SettingController.php
│   └── Frontend/
│       ├── PageController.php
│       └── ArticleController.php
├── Models/
│   ├── Page.php
│   ├── PageSection.php
│   ├── Article.php
│   └── Setting.php
├── Jobs/
│   └── GenerateArticleSEOJob.php
└── Services/
    ├── PageBuilderService.php
    ├── SEOGeneratorService.php
    └── MediaService.php

resources/js/
├── Pages/
│   ├── Admin/
│   │   ├── Pages/
│   │   │   ├── Index.jsx
│   │   │   ├── Builder.jsx   ← Page Builder utama
│   │   │   └── Edit.jsx
│   │   └── Articles/
│   │       ├── Index.jsx
│   │       └── Editor.jsx
│   └── Frontend/
│       ├── Page.jsx          ← Render section dinamis
│       └── Article.jsx
├── Components/
│   ├── Builder/
│   │   ├── SectionList.jsx
│   │   ├── SectionItem.jsx
│   │   └── SectionEditor.jsx
│   ├── Sections/             ← Render tiap tipe section
│   │   ├── HeroSection.jsx
│   │   ├── ServicesSection.jsx
│   │   ├── ImageCompareSection.jsx
│   │   └── ...
│   └── SEO/
│       └── SEOHead.jsx
└── Layouts/
    ├── AdminLayout.jsx
    └── FrontendLayout.jsx
```

### 5.2 SSR untuk SEO

Gunakan **Inertia SSR** dengan Node.js server:

```php
// config/inertia.php
'ssr' => [
    'enabled' => true,
    'url' => 'http://127.0.0.1:13714',
],
```

Meta tag SEO di-inject via `usePage()` props dari Laravel controller:

```php
// PageController.php
return Inertia::render('Frontend/Page', [
    'page' => $page,
    'sections' => $page->sections()->visible()->ordered()->get(),
    'seo' => [
        'title' => $page->meta_title,
        'description' => $page->meta_description,
        'og_image' => $page->meta_og_image,
    ]
]);
```

### 5.3 Queue untuk SEO Generator

```php
// GenerateArticleSEOJob.php
class GenerateArticleSEOJob implements ShouldQueue
{
    public function handle(): void
    {
        $response = Http::withHeaders([
            'x-api-key' => config('services.claude.api_key'),
            'anthropic-version' => '2023-06-01',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model' => 'claude-sonnet-4-20250514',
            'max_tokens' => 500,
            'messages' => [[
                'role' => 'user',
                'content' => "Generate SEO untuk artikel berikut dalam JSON: {$this->article->content}"
            ]]
        ]);

        // Update artikel dengan hasil generate
        $this->article->update([
            'meta_title' => $seo['meta_title'],
            'meta_description' => $seo['meta_description'],
            'meta_keywords' => $seo['keywords'],
        ]);
    }
}
```

---

## 6. UI/UX Requirements

### 6.1 Design System

| Token | Value |
|-------|-------|
| Primary Color | Dapat dikonfigurasi dari admin (default: biru) |
| Font | Inter atau Poppins (Google Fonts) |
| Border Radius | 8px default |
| Shadow | Soft shadow system |
| Breakpoints | Tailwind default (sm, md, lg, xl, 2xl) |

### 6.2 Frontend Requirements

- Mobile-first responsive design
- Page load time < 2 detik (LCP)
- Core Web Vitals score > 90 (semua kategori)
- Dark mode support (opsional v2)
- Animasi entrance section (Intersection Observer)
- Sticky header dengan scroll behavior

### 6.3 Admin Panel Requirements

- Sidebar collapsible
- Tabel dengan sorting, filter, pagination
- Toast notification untuk feedback aksi
- Loading state & skeleton UI
- Konfirmasi delete modal
- Undo untuk aksi destruktif

---

## 7. Non-Functional Requirements

| Kategori | Requirement |
|----------|-------------|
| Performance | Time to First Byte (TTFB) < 200ms dengan SSR |
| SEO | Semua halaman public harus SSR, bukan CSR |
| Security | CSRF protection, XSS sanitize konten HTML, rate limiting form |
| Accessibility | WCAG 2.1 Level AA minimal |
| Scalability | Bisa handle 10.000 halaman tanpa degradasi |
| Backup | Daily backup DB + storage ke S3 |

---

## 8. Milestones & Estimasi

| Fase | Scope | Estimasi |
|------|-------|----------|
| Fase 1 — Foundation | Setup Laravel + Inertia + React, Auth, Admin layout, Global Settings, Media Library | 2 minggu |
| Fase 2 — Page Builder | CRUD halaman, Section Builder (drag-drop), 8 section types dasar, Frontend renderer | 3 minggu |
| Fase 3 — Blog & SEO | Artikel CRUD, TipTap editor, SEO auto-generate (queue), sitemap, schema markup | 2 minggu |
| Fase 4 — Image Compare | Section Image Compare, react-compare-slider, admin upload | 1 minggu |
| Fase 5 — Polish | Form kontak, WhatsApp button, Navigasi dinamis, SEO score UI, Performance audit | 1 minggu |
| **Total** | | **~9 minggu** |

---

## 9. Dependencies & Libraries

```json
{
  "php": {
    "laravel/framework": "^11.0",
    "inertiajs/inertia-laravel": "^1.0",
    "tightenco/ziggy": "^2.0",
    "intervention/image": "^3.0",
    "spatie/laravel-sitemap": "^7.0",
    "spatie/laravel-medialibrary": "^11.0"
  },
  "javascript": {
    "react": "^18.0",
    "@inertiajs/react": "^1.0",
    "tailwindcss": "^4.0",
    "@tiptap/react": "^2.0",
    "@dnd-kit/core": "^6.0",
    "@dnd-kit/sortable": "^8.0",
    "react-compare-slider": "^3.0",
    "framer-motion": "^11.0",
    "lucide-react": "^0.383.0",
    "react-hot-toast": "^2.0",
    "zustand": "^4.0"
  }
}
```

---

## 10. Out of Scope (v1)

- E-commerce / pembelian online
- Multi-language (i18n)
- Push notification
- Live chat (selain WhatsApp)
- Mobile app
- Multi-tenant

---

## 11. Referensi

- Website referensi: [fentacom.id](https://www.fentacom.id)
- Tech docs: [laravel.com](https://laravel.com), [inertiajs.com](https://inertiajs.com)
- Component: [react-compare-slider](https://react-compare-slider.vercel.app)
- Editor: [tiptap.dev](https://tiptap.dev)
- DnD: [@dnd-kit](https://dndkit.com)

---

*Dokumen ini dibuat pada Mei 2026. Versi berikutnya akan mencakup fitur dark mode, multi-language, dan integrasi payment gateway.*
