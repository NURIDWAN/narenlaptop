<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArticleCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = ArticleCategory::query()
            ->withCount('articles')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/ArticleCategories/Index', [
            'categories' => $categories,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $data['slug'] = $this->generateUniqueSlug($data['slug'] ?: $data['name']);

        ArticleCategory::create($data);

        return back()->with('success', 'Kategori artikel berhasil ditambahkan.');
    }

    public function update(Request $request, ArticleCategory $article_category): RedirectResponse
    {
        $data = $this->validatedData($request, $article_category);
        $data['slug'] = $this->generateUniqueSlug($data['slug'] ?: $data['name'], $article_category->id);

        $article_category->update($data);

        return back()->with('success', 'Kategori artikel berhasil diperbarui.');
    }

    public function destroy(ArticleCategory $article_category): RedirectResponse
    {
        Article::query()->where('category_id', $article_category->id)->update(['category_id' => null]);
        $article_category->delete();

        return back()->with('success', 'Kategori artikel berhasil dihapus.');
    }

    private function validatedData(Request $request, ?ArticleCategory $articleCategory = null): array
    {
        $slug = trim((string) $request->input('slug'));

        return $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'slug' => [empty($slug) ? 'nullable' : 'required', 'string', 'max:180', 'unique:article_categories,slug,'.($articleCategory?->id ?? 'NULL')],
            'description' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);
    }

    private function generateUniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value);
        if ($base === '') {
            $base = 'kategori-artikel';
        }

        $slug = $base;
        $counter = 2;

        while (
            ArticleCategory::query()
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
