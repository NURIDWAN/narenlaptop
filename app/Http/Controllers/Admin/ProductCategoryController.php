<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = ProductCategory::query()
            ->withCount('products')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/ProductCategories/Index', [
            'categories' => $categories,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $data['slug'] = $this->generateUniqueSlug($data['slug'] ?: $data['name']);

        ProductCategory::create($data);

        return back()->with('success', 'Kategori produk berhasil ditambahkan.');
    }

    public function update(Request $request, ProductCategory $product_category): RedirectResponse
    {
        $data = $this->validatedData($request, $product_category);
        $data['slug'] = $this->generateUniqueSlug($data['slug'] ?: $data['name'], $product_category->id);

        $product_category->update($data);

        return back()->with('success', 'Kategori produk berhasil diperbarui.');
    }

    public function destroy(ProductCategory $product_category): RedirectResponse
    {
        Product::query()->where('category_id', $product_category->id)->update(['category_id' => null]);
        $product_category->delete();

        return back()->with('success', 'Kategori produk berhasil dihapus.');
    }

    private function validatedData(Request $request, ?ProductCategory $productCategory = null): array
    {
        $slug = trim((string) $request->input('slug'));

        return $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'slug' => [empty($slug) ? 'nullable' : 'required', 'string', 'max:180', 'unique:product_categories,slug,'.($productCategory?->id ?? 'NULL')],
            'description' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);
    }

    private function generateUniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value);
        if ($base === '') {
            $base = 'kategori-produk';
        }

        $slug = $base;
        $counter = 2;

        while (
            ProductCategory::query()
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
