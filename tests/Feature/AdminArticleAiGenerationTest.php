<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdminArticleAiGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_generate_educational_article_with_global_settings_and_overrides(): void
    {
        $this->setAiSettings([
            'ai_api_key' => 'gemini-key',
            'ai_base_url' => 'https://generativelanguage.googleapis.com/v1beta/openai',
            'ai_model' => 'gemini-2.5-flash',
            'ai_article_word_count' => '1200',
            'ai_article_tone' => 'edukatif, praktis, dan ramah pemula',
            'ai_article_audience' => 'pemilik laptop rumahan',
            'ai_article_brand_context' => 'Naren Laptop membantu diagnosis dan perawatan laptop.',
            'ai_article_cta' => 'Ajak pembaca konsultasi jika gejala belum jelas.',
            'ai_article_internal_links' => "/blog\n/kontak",
            'ai_article_prompt_notes' => 'Bahas penyebab umum dan langkah pencegahan.',
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['content' => json_encode([
                        'title' => 'Cara Merawat Baterai Laptop agar Awet',
                        'excerpt' => 'Panduan edukatif merawat baterai laptop agar lebih tahan lama.',
                        'content' => '<h2>Kenapa baterai cepat rusak?</h2><p>Konten edukatif.</p><a href="/kontak">Konsultasi</a>',
                        'meta_title' => 'Cara Merawat Baterai Laptop agar Lebih Awet',
                        'meta_description' => 'Pelajari cara merawat baterai laptop agar awet, aman, dan tidak cepat drop dengan langkah sederhana.',
                        'meta_keywords' => ['baterai laptop', 'merawat baterai laptop', 'service laptop'],
                    ])],
                ]],
            ]),
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);
        $category = ArticleCategory::create(['name' => 'Tips Laptop', 'slug' => 'tips-laptop']);

        $response = $this->actingAs($user)->postJson(route('admin.articles.generate'), [
            'topic' => 'Cara merawat baterai laptop agar awet',
            'main_keyword' => 'merawat baterai laptop',
            'category_id' => $category->id,
            'brief' => 'Jelaskan dengan bahasa non-teknis.',
            'word_count' => 1500,
        ]);

        $response->assertOk()
            ->assertJson(['title' => 'Cara Merawat Baterai Laptop agar Awet']);

        $article = Article::query()->where('title', 'Cara Merawat Baterai Laptop agar Awet')->firstOrFail();
        $this->assertSame('draft', $article->status);
        $this->assertSame($category->id, $article->category_id);
        $this->assertSame($user->id, $article->author_id);
        $this->assertSame(['baterai laptop', 'merawat baterai laptop', 'service laptop'], $article->meta_keywords);
        $this->assertStringContainsString('/kontak', $article->content);

        Http::assertSent(function (Request $request) {
            $prompt = $request['messages'][0]['content'] ?? '';

            return $request->hasHeader('Authorization', 'Bearer gemini-key')
                && $request['model'] === 'gemini-2.5-flash'
                && $request['max_tokens'] === 4500
                && str_contains($prompt, 'Target panjang artikel sekitar 1500 kata')
                && str_contains($prompt, 'Keyword utama: merawat baterai laptop')
                && str_contains($prompt, 'Kategori artikel: Tips Laptop')
                && str_contains($prompt, 'pemilik laptop rumahan')
                && str_contains($prompt, '/blog, /kontak')
                && str_contains($prompt, 'Jelaskan dengan bahasa non-teknis');
        });
    }

    public function test_generate_article_returns_api_error_message(): void
    {
        $this->setAiSettings([
            'ai_api_key' => 'bad-key',
            'ai_base_url' => 'https://generativelanguage.googleapis.com/v1beta/openai',
            'ai_model' => 'gemini-2.5-flash',
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' => Http::response([
                'error' => ['message' => 'quota habis'],
            ], 429),
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->postJson(route('admin.articles.generate'), [
            'topic' => 'Cara membersihkan keyboard laptop',
        ])->assertStatus(422)->assertJson([
            'error' => 'AI error (429): quota habis',
        ]);
    }

    public function test_generate_article_returns_parse_error_for_invalid_ai_json(): void
    {
        $this->setAiSettings([
            'ai_api_key' => 'gemini-key',
            'ai_base_url' => 'https://generativelanguage.googleapis.com/v1beta/openai',
            'ai_model' => 'gemini-2.5-flash',
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['content' => 'Artikel berhasil dibuat, tapi bukan JSON.'],
                ]],
            ]),
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->postJson(route('admin.articles.generate'), [
            'topic' => 'Cara membersihkan keyboard laptop',
        ])->assertStatus(422)->assertJson([
            'error' => 'Gagal parse response AI. Coba lagi.',
        ]);
    }

    private function setAiSettings(array $settings): void
    {
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
