<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        return Inertia::render('Products/Index', [
            'products' => Product::query()
                ->active()
                ->when($search !== '', function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%")
                            ->orWhere('badge', 'like', "%{$search}%");
                    });
                })
                ->paginate(12)
                ->withQueryString()
                ->through(fn (Product $product) => $this->productPayload($product)),
            'filters' => ['search' => $search],
            'seo' => [
                'title' => 'Produk',
                'description' => 'Pilihan laptop dan perangkat unggulan yang tersedia di Lumina Tech.',
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $product = Product::query()
            ->active()
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedProducts = Product::query()
            ->active()
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get()
            ->map(fn (Product $related) => $this->productPayload($related))
            ->values();

        return Inertia::render('Products/Show', [
            'product' => $this->productPayload($product),
            'relatedProducts' => $relatedProducts,
            'seo' => [
                'title' => $product->name,
                'description' => str($product->description ?? '')->stripTags()->limit(155)->toString(),
                'og_image' => $this->productImages($product)[0] ?? null,
            ],
        ]);
    }

    private function productPayload(Product $product): array
    {
        $images = $this->productImages($product);

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => $product->price,
            'discount_price' => $product->discount_price,
            'badge' => $product->badge,
            'image' => $images[0] ?? null,
            'images' => $images,
            'cta_url' => $product->cta_url,
        ];
    }

    private function productImages(Product $product): array
    {
        $images = collect($product->images ?? [])
            ->filter()
            ->values()
            ->all();

        if (empty($images) && $product->image) {
            $images = [$product->image];
        }

        return $images;
    }
}
