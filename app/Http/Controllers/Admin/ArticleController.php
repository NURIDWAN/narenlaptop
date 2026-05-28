<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Media;
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
}
