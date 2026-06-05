<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Services\SEOGeneratorService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $categorySlug = $request->string('category')->toString();
        $search = trim((string) $request->query('search', ''));
        $selectedCategory = $categorySlug !== ''
            ? ArticleCategory::query()->where('slug', $categorySlug)->first()
            : null;

        return Inertia::render('Blog/Index', [
            'categories' => ArticleCategory::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'selectedCategory' => $selectedCategory?->slug,
            'selectedCategoryDescription' => $selectedCategory?->description,
            'articles' => Article::query()
                ->published()
                ->when($selectedCategory, fn ($query) => $query->where('category_id', $selectedCategory->id))
                ->when($search !== '', fn ($query) => $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('excerpt', 'like', "%{$search}%");
                }))
                ->with('category')
                ->latest('published_at')
                ->paginate(9)
                ->withQueryString(),
            'filters' => ['search' => $search],
            'seo' => [
                'title' => $selectedCategory?->meta_title ?: ($selectedCategory?->name ? $selectedCategory->name.' - Blog' : 'Blog - Artikel Service Laptop & Gadget'),
                'description' => $selectedCategory?->meta_description ?: ($selectedCategory?->description ? strip_tags($selectedCategory->description) : 'Artikel terbaru seputar service laptop, gadget, tips perawatan, dan solusi IT terpercaya.'),
                'keywords' => 'service laptop, gadget, tips perawatan laptop, perbaikan laptop, teknologi',
                'canonical' => $selectedCategory ? route('blog.index', ['category' => $selectedCategory->slug]) : route('blog.index'),
                'og_type' => 'website',
            ],
            'breadcrumbs' => $selectedCategory
                ? [['name' => 'Home', 'url' => url('/')], ['name' => 'Blog', 'url' => route('blog.index')], ['name' => $selectedCategory->name, 'url' => route('blog.index', ['category' => $selectedCategory->slug])]]
                : [['name' => 'Home', 'url' => url('/')], ['name' => 'Blog', 'url' => route('blog.index')]],
        ]);
    }

    public function category(string $slug): Response
    {
        return redirect()->route('blog.index', ['category' => $slug]);
    }

    public function show(string $slug, SEOGeneratorService $seoGenerator): Response
    {
        $article = Article::query()
            ->published()
            ->where('slug', $slug)
            ->with(['category', 'author'])
            ->firstOrFail();

        $article->increment('view_count');
        $relatedArticles = Article::query()
            ->published()
            ->where('id', '!=', $article->id)
            ->when($article->category_id, fn ($query) => $query->where('category_id', $article->category_id))
            ->with('category')
            ->latest('published_at')
            ->take(3)
            ->get();

        $keywords = is_array($article->meta_keywords) ? implode(', ', $article->meta_keywords) : ($article->meta_keywords ?? '');

        return Inertia::render('Frontend/Article', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
            'schema' => $seoGenerator->schemaForArticle($article),
            'seo' => [
                'title' => $article->meta_title ?: $article->title,
                'description' => $article->meta_description ?: ($article->excerpt ?: \Illuminate\Support\Str::limit(strip_tags($article->content ?? ''), 155)),
                'keywords' => $keywords,
                'og_image' => $article->og_image ?: $article->thumbnail,
                'canonical' => route('blog.show', $article->slug),
                'og_type' => 'article',
                'published_time' => optional($article->published_at ?? $article->created_at)->toIso8601String(),
                'modified_time' => optional($article->updated_at)->toIso8601String(),
                'author' => $article->author?->name ?? config('app.name'),
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => url('/')],
                ['name' => 'Blog', 'url' => route('blog.index')],
                ['name' => $article->title, 'url' => route('blog.show', $article->slug)],
            ],
        ]);
    }
}
