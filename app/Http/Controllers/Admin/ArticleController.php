<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Media;
use App\Models\Setting;
use App\Services\SEOGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $articles = Article::query()
            ->with(['category', 'author'])
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->category_id, fn ($q, $c) => $q->where('category_id', $c))
            ->when($request->sort, function ($q) use ($request) {
                $dir = $request->direction === 'asc' ? 'asc' : 'desc';
                $q->orderBy($request->sort, $dir);
            }, fn ($q) => $q->latest())
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Articles/Index', [
            'articles' => $articles,
            'filters' => $request->only('search', 'status', 'sort', 'direction', 'category_id'),
            'categories' => ArticleCategory::query()->orderBy('name')->get(['id', 'name']),
            'aiArticleSettings' => $this->aiArticleSettings(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Articles/Editor', [
            'article' => [
                'title' => '',
                'slug' => '',
                'excerpt' => '',
                'content' => '',
                'status' => 'draft',
                'category_id' => null,
                'meta_title' => '',
                'meta_description' => '',
                'meta_keywords' => [],
                'schema_type' => 'Article',
            ],
            'categories' => ArticleCategory::query()->orderBy('name')->get(),
            'seoScore' => null,
        ]);
    }

    public function store(Request $request, SEOGeneratorService $seoGenerator): RedirectResponse
    {
        $data = $this->validatedData($request);
        $data['author_id'] = $request->user()->id;
        $data['slug'] = $this->generateUniqueSlug($data['slug'] ?: $data['title']);
        $this->storeThumbnailFile($request, $data);
        $data = $this->applyGeneratedSeoData(new Article($data), $data, $seoGenerator);

        $article = Article::create($data);

        \App\Jobs\GenerateArticleSEOJob::dispatch($article);

        return to_route('admin.articles.edit', $article)->with('success', 'Artikel berhasil dibuat.');
    }

    public function show(Article $article): Response
    {
        $article->load(['category', 'author']);

        return Inertia::render('Frontend/Article', [
            'article' => $article,
            'schema' => app(SEOGeneratorService::class)->schemaForArticle($article),
        ]);
    }

    public function edit(Article $article, SEOGeneratorService $seoGenerator): Response
    {
        return Inertia::render('Admin/Articles/Editor', [
            'article' => $article,
            'categories' => ArticleCategory::query()->orderBy('name')->get(),
            'seoScore' => $seoGenerator->scoreArticle($article),
        ]);
    }

    public function update(Request $request, Article $article, SEOGeneratorService $seoGenerator): RedirectResponse
    {
        $data = $this->validatedData($request, $article);
        $data['slug'] = $this->generateUniqueSlug($data['slug'] ?: $data['title'], $article->id);
        $this->storeThumbnailFile($request, $data);
        $data = $this->applyGeneratedSeoData($article->replicate()->fill(array_merge($article->toArray(), $data)), $data, $seoGenerator);

        $article->update($data);

        \App\Jobs\GenerateArticleSEOJob::dispatch($article);

        return back()->with('success', 'Artikel berhasil disimpan.');
    }

    public function destroy(Article $article): RedirectResponse
    {
        $article->delete();

        return to_route('admin.articles.index')->with('success', 'Artikel dihapus.');
    }

    private function validatedData(Request $request, ?Article $article = null): array
    {
        $slug = trim((string) $request->input('slug'));

        return $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'slug' => [empty($slug) ? 'nullable' : 'required', 'string', 'max:180', 'unique:articles,slug,'.($article?->id ?? 'NULL')],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'string', 'max:500'],
            'thumbnail_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:5120'],
            'category_id' => ['nullable', 'integer'],
            'status' => ['required', 'in:draft,published,scheduled'],
            'published_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'array'],
            'og_image' => ['nullable', 'string', 'max:500'],
            'schema_type' => ['required', 'in:Article,HowTo,FAQPage'],
        ]);
    }

    private function storeThumbnailFile(Request $request, array &$data): void
    {
        if (! $request->hasFile('thumbnail_file')) {
            unset($data['thumbnail_file']);
            return;
        }

        $path = $request->file('thumbnail_file')->store('media', 'public');
        $media = Media::create([
            'filename' => $request->file('thumbnail_file')->getClientOriginalName(),
            'path' => $path,
            'disk' => 'public',
            'mime_type' => $request->file('thumbnail_file')->getMimeType(),
            'size' => $request->file('thumbnail_file')->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);
        $data['thumbnail'] = $media->url;
        unset($data['thumbnail_file']);
    }

    private function applyGeneratedSeoData(Article $article, array $data, SEOGeneratorService $seoGenerator): array
    {
        $generated = $seoGenerator->generateForArticle($article);

        $data['meta_title'] = $data['meta_title'] ?: $generated['meta_title'];
        $data['meta_description'] = $data['meta_description'] ?: $generated['meta_description'];
        $data['meta_keywords'] = empty($data['meta_keywords']) ? $generated['meta_keywords'] : $data['meta_keywords'];
        $data['excerpt'] = $data['excerpt'] ?: $generated['excerpt'];
        $data['reading_time'] = $generated['reading_time'];
        $data['schema_type'] = $data['schema_type'] ?: $generated['schema_type'];
        $data['og_image'] = $data['og_image'] ?: ($data['thumbnail'] ?? null);

        return $data;
    }

    private function generateUniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value);
        if ($base === '') {
            $base = 'artikel';
        }

        $slug = $base;
        $counter = 2;

        while (
            Article::query()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    public function generate(Request $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate([
            'topic' => ['required', 'string', 'max:500'],
            'main_keyword' => ['nullable', 'string', 'max:180'],
            'category_id' => ['nullable', 'integer', 'exists:article_categories,id'],
            'brief' => ['nullable', 'string', 'max:2000'],
            'word_count' => ['nullable', 'integer', 'min:500', 'max:2500'],
        ]);

        $settings = Setting::query()
            ->whereIn('key', array_merge(['ai_api_key', 'ai_base_url', 'ai_model'], array_keys($this->aiArticleDefaults())))
            ->pluck('value', 'key');
        $apiKey = $settings['ai_api_key'] ?? config('services.gemini.api_key');
        if (! $apiKey) {
            return response()->json(['error' => 'API key belum dikonfigurasi. Buka Pengaturan > Gemini AI.'], 422);
        }

        $baseUrl = rtrim($settings['ai_base_url'] ?? config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta/openai'), '/');
        $model = $settings['ai_model'] ?? config('services.gemini.model', 'gemini-2.5-flash');
        $articleSettings = array_merge($this->aiArticleDefaults(), $settings->only(array_keys($this->aiArticleDefaults()))->all());
        $wordCount = (int) ($data['word_count'] ?? $articleSettings['ai_article_word_count']);
        $wordCount = max(500, min(2500, $wordCount));
        $category = ! empty($data['category_id'])
            ? ArticleCategory::query()->find($data['category_id'])
            : null;

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(60)->post("{$baseUrl}/chat/completions", [
                'model' => $model,
                'max_tokens' => max(2048, min(8192, $wordCount * 3)),
                'messages' => [[
                    'role' => 'user',
                    'content' => $this->buildArticlePrompt($data, $articleSettings, $wordCount, $category),
                ]],
            ]);

            if (! $response->successful()) {
                $errorMsg = $response->json('error.message') ?? $response->json('message') ?? 'HTTP '.$response->status();
                if (is_array($errorMsg)) {
                    $errorMsg = json_encode($errorMsg);
                }

                return response()->json(['error' => 'AI error ('.$response->status().'): '.$errorMsg], 422);
            }

            $text = $response->json('choices.0.message.content', '');
            if (preg_match('/\{[\s\S]*\}/', $text, $m)) {
                $data = json_decode($m[0], true);
                if (is_array($data) && ! empty($data['title'])) {
                    $slug = $this->generateUniqueSlug($data['title']);
                    $article = Article::create([
                        'title' => $data['title'],
                        'slug' => $slug,
                        'excerpt' => $data['excerpt'] ?? '',
                        'content' => $data['content'] ?? '',
                        'status' => 'draft',
                        'category_id' => $category?->id,
                        'author_id' => $request->user()->id,
                        'meta_title' => $data['meta_title'] ?? '',
                        'meta_description' => $data['meta_description'] ?? '',
                        'meta_keywords' => $data['meta_keywords'] ?? [],
                        'schema_type' => 'Article',
                        'reading_time' => max(1, (int) ceil(str_word_count(strip_tags($data['content'] ?? '')) / 200)),
                    ]);

                    return response()->json(['id' => $article->id, 'title' => $article->title]);
                }
            }

            return response()->json(['error' => 'Gagal parse response AI. Coba lagi.'], 422);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json(['error' => 'Tidak dapat terhubung ke server AI. Periksa Base URL: '.$e->getMessage()], 422);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Error: '.$e->getMessage()], 422);
        }
    }

    private function aiArticleDefaults(): array
    {
        return [
            'ai_article_word_count' => '1000',
            'ai_article_tone' => 'edukatif dan mudah dipahami',
            'ai_article_audience' => 'pemilik laptop dan gadget non-teknis',
            'ai_article_brand_context' => 'Naren Laptop adalah layanan service laptop dan gadget yang membantu pelanggan memahami masalah perangkat, opsi perbaikan, dan cara perawatan dengan bahasa yang jelas.',
            'ai_article_cta' => 'Ajak pembaca berkonsultasi dengan Naren Laptop jika membutuhkan diagnosis atau bantuan service.',
            'ai_article_internal_links' => "/blog\n/produk\n/kontak",
            'ai_article_prompt_notes' => '',
        ];
    }

    private function aiArticleSettings(): array
    {
        $settings = Setting::query()
            ->whereIn('key', array_keys($this->aiArticleDefaults()))
            ->pluck('value', 'key')
            ->all();

        return array_merge($this->aiArticleDefaults(), $settings);
    }

    private function buildArticlePrompt(array $data, array $settings, int $wordCount, ?ArticleCategory $category): string
    {
        $internalLinks = collect(preg_split('/\r\n|\r|\n/', (string) $settings['ai_article_internal_links']))
            ->map(fn ($link) => trim($link))
            ->filter()
            ->values()
            ->implode(', ');

        return implode("\n\n", array_filter([
            'Kamu adalah penulis artikel edukatif dan SEO specialist untuk website service laptop dan gadget berbahasa Indonesia.',
            'Buat artikel blog panjang dan informatif tentang: "'.$data['topic'].'".',
            ! empty($data['main_keyword']) ? 'Keyword utama: '.$data['main_keyword'].'. Gunakan secara natural di judul, pembuka, beberapa heading, dan meta.' : null,
            $category ? 'Kategori artikel: '.$category->name.'.' : null,
            ! empty($data['brief']) ? 'Brief/catatan khusus dari admin: '.$data['brief'] : null,
            'Target panjang artikel sekitar '.$wordCount.' kata.',
            'Target pembaca: '.$settings['ai_article_audience'].'.',
            'Gaya bahasa: '.$settings['ai_article_tone'].'. Jangan terlalu promosi, jangan clickbait, dan jelaskan istilah teknis dengan sederhana.',
            'Konteks brand: '.$settings['ai_article_brand_context'],
            'Struktur konten: gunakan HTML bersih berisi paragraf, h2, h3, ul/ol bila relevan, dan FAQ singkat bila membantu pembaca.',
            'SEO: buat meta_title 50-60 karakter, meta_description 150-160 karakter, dan 5-8 meta_keywords relevan.',
            $internalLinks ? 'Tambahkan minimal 1 internal link natural dari daftar berikut: '.$internalLinks.'.' : null,
            'CTA akhir artikel: '.$settings['ai_article_cta'],
            ! empty($settings['ai_article_prompt_notes']) ? 'Instruksi tambahan: '.$settings['ai_article_prompt_notes'] : null,
            'Hindari klaim garansi, harga, estimasi pasti, atau diagnosis final jika tidak ada data. Sarankan pemeriksaan teknisi untuk kasus yang tidak pasti.',
            'Balas HANYA dengan JSON valid tanpa markdown code block, dengan format: {"title": "judul artikel menarik", "excerpt": "ringkasan 1-2 kalimat", "content": "<p>konten HTML lengkap</p>", "meta_title": "50-60 karakter", "meta_description": "150-160 karakter", "meta_keywords": ["keyword1", "keyword2"]}',
        ]));
    }
}
