<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\NavigationMenu;
use App\Models\Page;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => Hash::make('password')],
        );

        // Settings
        $settings = [
            'site_name' => 'Lumina Tech',
            'primary_color' => '#2563eb',
            'whatsapp_number' => '6281234567890',
            'email' => 'halo@luminatech.id',
            'address' => 'Jl. Margonda Raya No. 100, Depok, Jawa Barat',
        ];
        foreach ($settings as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // Testimonials
        collect([
            ['name' => 'Budi Santoso', 'role' => 'Freelancer', 'content' => 'Beli MacBook Pro di sini pelayanannya sangat memuaskan. Unit mulus, garansi jelas.', 'rating' => 5, 'order' => 0],
            ['name' => 'Sarah Wijaya', 'role' => 'Designer', 'content' => 'Service ganti baterai Dell XPS cuma nunggu 1 jam beres. Teknisi informatif.', 'rating' => 5, 'order' => 1],
            ['name' => 'Andi Pratama', 'role' => 'Mahasiswa', 'content' => 'Tukar tambah laptop lama dapat harga tinggi. Proses pengecekan transparan.', 'rating' => 5, 'order' => 2],
        ])->each(fn ($t) => Testimonial::query()->updateOrCreate(['name' => $t['name']], [...$t, 'is_active' => true]));

        // Team
        collect([
            ['name' => 'Raka Aditya', 'role' => 'Founder & Lead Technician', 'order' => 0],
            ['name' => 'Dimas Prasetyo', 'role' => 'Hardware Specialist', 'order' => 1],
            ['name' => 'Siti Nurhaliza', 'role' => 'Customer Support', 'order' => 2],
        ])->each(fn ($m) => TeamMember::query()->updateOrCreate(['name' => $m['name']], [...$m, 'is_active' => true]));

        // ===== PAGES =====

        $this->seedBeranda();
        $this->seedService();
        $this->seedCatalog();
        $this->seedAbout();
        $this->seedContact();

        // Navigation
        $this->seedNavigation();

        // Article
        $this->seedArticle($admin);
    }

    private function seedBeranda(): void
    {
        $page = Page::query()->updateOrCreate(['slug' => 'beranda'], [
            'title' => 'Beranda',
            'status' => 'published',
            'meta_title' => 'Lumina Tech — Jual Beli & Service Laptop Terpercaya',
            'meta_description' => 'Solusi laptop premium: jual beli, service bergaransi, dan tukar tambah di Depok.',
        ]);
        $page->sections()->delete();
        $page->sections()->createMany([
            ['type' => 'hero', 'order' => 0, 'is_visible' => true, 'settings' => [
                'title' => 'Jual Beli & Service Laptop Terpercaya',
                'subtitle' => 'Solusi teknologi premium untuk produktivitas tanpa batas. Kualitas terjamin, servis profesional.',
                'cta_text' => 'Lihat Katalog',
                'cta_url' => '/katalog',
                'secondary_text' => 'Booking Service',
                'secondary_url' => '/service',
                'background_image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80',
                'overlay_opacity' => 0.6,
            ]],
            ['type' => 'services', 'order' => 1, 'is_visible' => true, 'settings' => [
                'title' => 'Layanan Kami',
                'subtitle' => 'Dari pembelian sampai perbaikan, semua dalam satu tempat.',
                'items' => [
                    ['title' => 'Jual Laptop Baru', 'description' => 'Pilihan laptop high-end dengan garansi resmi.'],
                    ['title' => 'Laptop Bekas Berkualitas', 'description' => 'Certified pre-owned, sudah dicek menyeluruh.'],
                    ['title' => 'Tukar Tambah', 'description' => 'Trade-in laptop lama dengan harga terbaik.'],
                    ['title' => 'Service & Perbaikan', 'description' => 'Teknisi berpengalaman untuk semua masalah laptop.'],
                    ['title' => 'Upgrade Hardware', 'description' => 'Tambah RAM, ganti SSD, dan upgrade komponen.'],
                    ['title' => 'IT Support Kantor', 'description' => 'Maintenance rutin perangkat dan jaringan bisnis.'],
                ],
            ]],
            ['type' => 'stats', 'order' => 2, 'is_visible' => true, 'settings' => [
                'items' => [
                    ['value' => '10+', 'label' => 'Tahun Pengalaman'],
                    ['value' => '5000+', 'label' => 'Laptop Terjual'],
                    ['value' => '12000+', 'label' => 'Service Selesai'],
                    ['value' => '98%', 'label' => 'Pelanggan Puas'],
                ],
            ]],
            ['type' => 'testimonials', 'order' => 3, 'is_visible' => true, 'settings' => [
                'title' => 'Kata Pelanggan',
                'subtitle' => 'Kepercayaan mereka adalah motivasi kami.',
                'source' => 'database',
            ]],
            ['type' => 'blog_list', 'order' => 4, 'is_visible' => true, 'settings' => [
                'title' => 'Artikel Terbaru',
                'subtitle' => 'Tips dan panduan seputar laptop dan teknologi.',
            ]],
            ['type' => 'cta', 'order' => 5, 'is_visible' => true, 'settings' => [
                'title' => 'Butuh Bantuan?',
                'description' => 'Konsultasi gratis via WhatsApp. Kami siap membantu kebutuhan laptop Anda.',
                'cta_text' => 'Chat WhatsApp',
                'cta_url' => 'https://wa.me/6281234567890',
            ]],
        ]);
    }

    private function seedService(): void
    {
        $page = Page::query()->updateOrCreate(['slug' => 'service'], [
            'title' => 'Service',
            'status' => 'published',
            'meta_title' => 'Service Laptop Bergaransi — Lumina Tech',
            'meta_description' => 'Layanan service laptop profesional: install ulang, upgrade SSD/RAM, ganti LCD, recovery data.',
        ]);
        $page->sections()->delete();
        $page->sections()->createMany([
            ['type' => 'hero', 'order' => 0, 'is_visible' => true, 'settings' => [
                'title' => 'Service Laptop Profesional',
                'subtitle' => 'Diagnosa jelas, estimasi transparan, pengerjaan cepat dan bergaransi.',
                'cta_text' => 'Booking Service',
                'cta_url' => 'https://wa.me/6281234567890?text=Halo,%20saya%20mau%20booking%20service%20laptop',
                'background_image' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1600&q=80',
                'overlay_opacity' => 0.65,
            ]],
            ['type' => 'pricing', 'order' => 1, 'is_visible' => true, 'settings' => [
                'title' => 'Paket Service',
                'subtitle' => 'Pilih sesuai kebutuhan. Semua paket termasuk diagnosa gratis.',
                'items' => [
                    ['name' => 'Basic', 'price' => 'Rp 150.000', 'description' => 'Perawatan ringan', 'features' => ['Bersih debu & kipas', 'Ganti thermal paste', 'Cek kesehatan hardware', 'Optimasi sistem'], 'cta_text' => 'Pilih Basic', 'cta_url' => 'https://wa.me/6281234567890', 'featured' => false],
                    ['name' => 'Standard', 'price' => 'Rp 350.000', 'description' => 'Perbaikan umum', 'features' => ['Semua fitur Basic', 'Install ulang OS', 'Update driver lengkap', 'Backup & restore data'], 'cta_text' => 'Pilih Standard', 'cta_url' => 'https://wa.me/6281234567890', 'featured' => true],
                    ['name' => 'Premium', 'price' => 'Mulai Rp 500.000', 'description' => 'Hardware & advance', 'features' => ['Semua fitur Standard', 'Ganti LCD/Keyboard', 'Upgrade SSD/RAM', 'Perbaikan motherboard'], 'cta_text' => 'Pilih Premium', 'cta_url' => 'https://wa.me/6281234567890', 'featured' => false],
                ],
            ]],
            ['type' => 'image_compare', 'order' => 2, 'is_visible' => true, 'settings' => [
                'title' => 'Hasil Kerja Kami',
                'subtitle' => 'Geser slider untuk melihat perbedaan sebelum dan sesudah service.',
                'before_image' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
                'after_image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
                'before_label' => 'Sebelum',
                'after_label' => 'Sesudah',
                'initial_position' => 50,
            ]],
            ['type' => 'faq', 'order' => 3, 'is_visible' => true, 'settings' => [
                'title' => 'FAQ Service',
                'subtitle' => 'Pertanyaan yang sering ditanyakan seputar layanan kami.',
                'items' => [
                    ['question' => 'Berapa lama waktu pengerjaan?', 'answer' => 'Tergantung kerusakan. Service ringan 1-2 jam, perbaikan hardware 1-3 hari kerja.'],
                    ['question' => 'Apakah ada garansi service?', 'answer' => 'Ya, semua service bergaransi 30 hari. Jika masalah yang sama muncul, kami perbaiki gratis.'],
                    ['question' => 'Bisa antar-jemput laptop?', 'answer' => 'Tersedia layanan pickup untuk area Depok dan sekitarnya dengan biaya tambahan.'],
                    ['question' => 'Data saya aman?', 'answer' => 'Kami menjamin keamanan data. Backup dilakukan sebelum pengerjaan jika diperlukan.'],
                ],
            ]],
        ]);
    }

    private function seedCatalog(): void
    {
        $page = Page::query()->updateOrCreate(['slug' => 'katalog'], [
            'title' => 'Katalog',
            'status' => 'published',
            'meta_title' => 'Katalog Laptop — Lumina Tech',
            'meta_description' => 'Jual laptop baru dan bekas berkualitas. Pilihan lengkap dari entry-level hingga high-end.',
        ]);
        $page->sections()->delete();
        $page->sections()->createMany([
            ['type' => 'hero', 'order' => 0, 'is_visible' => true, 'settings' => [
                'title' => 'Katalog Laptop',
                'subtitle' => 'Pilihan laptop baru dan bekas berkualitas dengan garansi. Temukan yang sesuai kebutuhan dan budget Anda.',
                'cta_text' => 'Tanya Stok',
                'cta_url' => 'https://wa.me/6281234567890?text=Halo,%20saya%20mau%20tanya%20stok%20laptop',
                'background_image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80',
                'overlay_opacity' => 0.6,
            ]],
            ['type' => 'pricing', 'order' => 1, 'is_visible' => true, 'settings' => [
                'title' => 'Kategori Produk',
                'subtitle' => 'Hubungi kami untuk ketersediaan stok terbaru.',
                'items' => [
                    ['name' => 'Entry Level', 'price' => 'Rp 3-7 Juta', 'description' => 'Untuk kebutuhan harian & pelajar', 'features' => ['Cocok kerja & kuliah', 'Intel i3/Ryzen 3', '8GB RAM, 256GB SSD', 'Garansi 1 tahun'], 'cta_text' => 'Lihat Stok', 'cta_url' => 'https://wa.me/6281234567890', 'featured' => false],
                    ['name' => 'Mid Range', 'price' => 'Rp 8-15 Juta', 'description' => 'Performa untuk profesional', 'features' => ['Desain & multimedia', 'Intel i5/Ryzen 5', '16GB RAM, 512GB SSD', 'Garansi 1 tahun'], 'cta_text' => 'Lihat Stok', 'cta_url' => 'https://wa.me/6281234567890', 'featured' => true],
                    ['name' => 'High End', 'price' => 'Rp 16-45 Juta', 'description' => 'Tanpa kompromi', 'features' => ['Creator & gaming pro', 'Intel i7/i9, Apple M2/M3', '32GB RAM, 1TB SSD', 'Garansi resmi'], 'cta_text' => 'Lihat Stok', 'cta_url' => 'https://wa.me/6281234567890', 'featured' => false],
                ],
            ]],
            ['type' => 'gallery', 'order' => 2, 'is_visible' => true, 'settings' => [
                'title' => 'Galeri Produk',
                'subtitle' => 'Beberapa unit yang tersedia di toko kami.',
                'source' => 'database',
            ]],
            ['type' => 'cta', 'order' => 3, 'is_visible' => true, 'settings' => [
                'title' => 'Tidak Menemukan yang Dicari?',
                'description' => 'Kami bisa carikan laptop sesuai spesifikasi dan budget Anda.',
                'cta_text' => 'Request Laptop',
                'cta_url' => 'https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20request%20laptop',
            ]],
        ]);
    }

    private function seedAbout(): void
    {
        $page = Page::query()->updateOrCreate(['slug' => 'tentang-kami'], [
            'title' => 'Tentang Kami',
            'status' => 'published',
            'meta_title' => 'Tentang Lumina Tech — Toko Laptop & Service Center',
            'meta_description' => 'Profil Lumina Tech sebagai penyedia laptop dan layanan service profesional di Depok sejak 2014.',
        ]);
        $page->sections()->delete();
        $page->sections()->createMany([
            ['type' => 'about', 'order' => 0, 'is_visible' => true, 'settings' => [
                'title' => 'Tentang Lumina Tech',
                'subtitle' => 'Toko laptop dan service center terpercaya di Depok sejak 2014.',
                'description' => 'Berawal dari workshop kecil, kini kami melayani ribuan pelanggan dengan standar kualitas tinggi. Fokus kami adalah transparansi, kecepatan, dan kepuasan pelanggan.',
                'image' => 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
            ]],
            ['type' => 'stats', 'order' => 1, 'is_visible' => true, 'settings' => [
                'title' => 'Pencapaian Kami',
                'items' => [
                    ['value' => '10+', 'label' => 'Tahun Berdiri'],
                    ['value' => '50.000+', 'label' => 'Pelanggan Dilayani'],
                    ['value' => '4', 'label' => 'Teknisi Tersertifikasi'],
                    ['value' => '30 Hari', 'label' => 'Garansi Service'],
                ],
            ]],
            ['type' => 'team', 'order' => 2, 'is_visible' => true, 'settings' => [
                'title' => 'Tim Kami',
                'subtitle' => 'Orang-orang di balik layanan Lumina Tech.',
                'source' => 'database',
            ]],
            ['type' => 'cta', 'order' => 3, 'is_visible' => true, 'settings' => [
                'title' => 'Ingin Bergabung?',
                'description' => 'Kami selalu terbuka untuk talenta baru yang passionate di bidang teknologi.',
                'cta_text' => 'Hubungi Kami',
                'cta_url' => '/kontak',
            ]],
        ]);
    }

    private function seedContact(): void
    {
        $page = Page::query()->updateOrCreate(['slug' => 'kontak'], [
            'title' => 'Kontak',
            'status' => 'published',
            'meta_title' => 'Kontak Lumina Tech',
            'meta_description' => 'Hubungi Lumina Tech untuk konsultasi, booking service, atau tanya stok laptop.',
        ]);
        $page->sections()->delete();
        $page->sections()->createMany([
            ['type' => 'contact', 'order' => 0, 'is_visible' => true, 'settings' => [
                'title' => 'Hubungi Kami',
                'subtitle' => 'Ada pertanyaan atau mau booking service? Kirim pesan atau langsung chat WhatsApp.',
            ]],
            ['type' => 'faq', 'order' => 1, 'is_visible' => true, 'settings' => [
                'title' => 'Pertanyaan Umum',
                'items' => [
                    ['question' => 'Dimana lokasi toko?', 'answer' => 'Jl. Margonda Raya No. 100, Depok, Jawa Barat. Buka Senin-Sabtu 09.00-20.00.'],
                    ['question' => 'Bisa konsultasi online dulu?', 'answer' => 'Bisa! Chat WhatsApp kami kapan saja untuk konsultasi gratis.'],
                    ['question' => 'Apakah melayani pengiriman?', 'answer' => 'Ya, kami melayani pengiriman laptop ke seluruh Indonesia via ekspedisi terpercaya.'],
                ],
            ]],
        ]);
    }

    private function seedNavigation(): void
    {
        NavigationMenu::query()->whereIn('location', ['header', 'footer'])->delete();

        $headerItems = [
            ['label' => 'Service', 'url' => '/service', 'order' => 0],
            ['label' => 'Katalog', 'url' => '/katalog', 'order' => 1],
            ['label' => 'Tentang', 'url' => '/tentang-kami', 'order' => 2],
            ['label' => 'Kontak', 'url' => '/kontak', 'order' => 3],
        ];
        foreach ($headerItems as $item) {
            NavigationMenu::create(['location' => 'header', ...$item]);
        }

        $footerItems = [
            ['label' => 'Tentang Kami', 'url' => '/tentang-kami', 'order' => 0],
            ['label' => 'Service', 'url' => '/service', 'order' => 1],
            ['label' => 'Blog', 'url' => '/blog', 'order' => 2],
            ['label' => 'WhatsApp', 'url' => 'https://wa.me/6281234567890', 'order' => 3, 'open_in_new_tab' => true],
        ];
        foreach ($footerItems as $item) {
            NavigationMenu::create(['location' => 'footer', ...$item]);
        }
    }

    private function seedArticle(User $admin): void
    {
        $category = ArticleCategory::query()->updateOrCreate(
            ['slug' => 'tips-laptop'],
            ['name' => 'Tips Laptop', 'description' => 'Panduan merawat dan memilih laptop.'],
        );

        Article::query()->updateOrCreate(['slug' => 'tanda-laptop-perlu-service'], [
            'title' => 'Tanda Laptop Perlu Segera Diservice',
            'excerpt' => 'Kenali gejala laptop bermasalah sebelum kerusakan makin berat.',
            'content' => '<h2>Tanda Laptop Perlu Segera Diservice</h2><p>Laptop yang sering panas, tiba-tiba mati, atau performanya turun drastis perlu dicek lebih awal. Pemeriksaan cepat membantu mencegah kerusakan komponen yang lebih mahal.</p><p>Beberapa tanda yang perlu diwaspadai:</p><ul><li>Kipas bersuara keras terus-menerus</li><li>Baterai cepat habis atau tidak mengisi</li><li>Layar berkedip atau ada garis</li><li>Performa sangat lambat meski RAM cukup</li></ul><p>Jika mengalami salah satu gejala di atas, segera konsultasikan ke teknisi kami.</p>',
            'category_id' => $category->id,
            'author_id' => $admin->id,
            'status' => 'published',
            'published_at' => now(),
            'schema_type' => 'Article',
            'reading_time' => 2,
        ]);
    }
}
