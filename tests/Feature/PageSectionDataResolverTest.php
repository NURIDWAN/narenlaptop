<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Slider;
use App\Services\PageSectionDataResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageSectionDataResolverTest extends TestCase
{
    use RefreshDatabase;

    public function test_blog_list_section_can_resolve_published_articles_from_category(): void
    {
        $category = ArticleCategory::create([
            'name' => 'Tips',
            'slug' => 'tips',
        ]);

        Article::create([
            'title' => 'Artikel Published',
            'slug' => 'artikel-published',
            'status' => 'published',
            'published_at' => now(),
            'category_id' => $category->id,
            'reading_time' => 2,
        ]);

        Article::create([
            'title' => 'Artikel Draft',
            'slug' => 'artikel-draft',
            'status' => 'draft',
            'category_id' => $category->id,
        ]);

        $sections = app(PageSectionDataResolver::class)->resolve([[
            'type' => 'blog_list',
            'settings' => [
                'source' => 'database',
                'article_source' => 'category',
                'category_id' => $category->id,
                'limit' => 3,
            ],
        ]]);

        $this->assertCount(1, $sections[0]['data']['articles']);
        $this->assertSame('Artikel Published', $sections[0]['data']['articles'][0]['title']);
    }

    public function test_cta_section_can_resolve_whatsapp_from_settings(): void
    {
        Setting::create(['key' => 'whatsapp_number', 'value' => '6281234567890']);
        Setting::create(['key' => 'whatsapp_message_default', 'value' => 'Halo admin']);

        $sections = app(PageSectionDataResolver::class)->resolve([[
            'type' => 'cta',
            'settings' => ['source' => 'database'],
        ]]);

        $this->assertSame('https://wa.me/6281234567890?text=Halo%20admin', $sections[0]['data']['whatsapp_url']);
    }

    public function test_services_section_can_resolve_active_services(): void
    {
        Service::create([
            'title' => 'Service Laptop',
            'description' => 'Perbaikan laptop.',
            'order' => 1,
            'is_active' => true,
        ]);

        Service::create([
            'title' => 'Layanan Nonaktif',
            'description' => 'Tidak tampil.',
            'order' => 2,
            'is_active' => false,
        ]);

        $sections = app(PageSectionDataResolver::class)->resolve([[
            'type' => 'services',
            'settings' => [
                'source' => 'database',
                'limit' => 6,
            ],
        ]]);

        $this->assertCount(1, $sections[0]['data']['items']);
        $this->assertSame('Service Laptop', $sections[0]['data']['items'][0]['title']);
    }

    public function test_slider_section_can_resolve_active_slides(): void
    {
        Slider::create([
            'title' => 'Promo Upgrade SSD',
            'subtitle' => 'Laptop lebih cepat.',
            'image' => '/storage/sliders/ssd.jpg',
            'badge' => 'Promo',
            'cta_text' => 'Konsultasi',
            'cta_url' => '/kontak',
            'order' => 1,
            'is_active' => true,
        ]);

        Slider::create([
            'title' => 'Slide Nonaktif',
            'order' => 2,
            'is_active' => false,
        ]);

        $sections = app(PageSectionDataResolver::class)->resolve([[
            'type' => 'slider',
            'settings' => [
                'source' => 'database',
                'limit' => 5,
            ],
        ]]);

        $this->assertCount(1, $sections[0]['data']['slides']);
        $this->assertSame('Promo Upgrade SSD', $sections[0]['data']['slides'][0]['title']);
    }
}
