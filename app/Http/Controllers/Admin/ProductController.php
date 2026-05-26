<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Products/Index', [
            'products' => Product::query()
                ->orderBy('order')
                ->orderBy('name')
                ->paginate(20),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->normalizedData($request);
        $data['slug'] = $this->generateUniqueSlug(($data['slug'] ?? '') ?: $data['name']);

        Product::create($data);

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->normalizedData($request);
        $data['slug'] = $this->generateUniqueSlug(($data['slug'] ?? '') ?: $data['name'], $product->id);

        $product->update($data);

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'slug' => ['nullable', 'string', 'max:180', 'unique:products,slug,'.($request->route('product')?->id ?? 'NULL')],
            'description' => ['nullable', 'string', 'max:20000'],
            'price' => ['nullable', 'string', 'max:120'],
            'discount_price' => ['nullable', 'string', 'max:120'],
            'badge' => ['nullable', 'string', 'max:80'],
            'image' => ['nullable', 'string', 'max:500'],
            'images' => ['nullable', 'array'],
            'images.*' => ['nullable', 'string', 'max:500'],
            'cta_url' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
    }

    private function normalizedData(Request $request): array
    {
        $validated = $this->validatedData($request);
        $images = collect($validated['images'] ?? [])
            ->map(fn ($image) => trim((string) $image))
            ->filter()
            ->values()
            ->all();

        if (empty($images) && ! empty($validated['image'])) {
            $images = [trim((string) $validated['image'])];
        }

        if ($request->hasFile('image_file')) {
            $request->validate([
                'image_file' => ['file', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:5120'],
            ]);
            $path = $request->file('image_file')->store('media', 'public');
            $media = Media::create([
                'filename' => $request->file('image_file')->getClientOriginalName(),
                'path' => $path,
                'disk' => 'public',
                'mime_type' => $request->file('image_file')->getMimeType(),
                'size' => $request->file('image_file')->getSize(),
                'uploaded_by' => $request->user()->id,
            ]);
            array_unshift($images, $media->url);
            $images = array_values(array_unique(array_filter($images)));
        }

        $validated['images'] = $images;
        $validated['image'] = $images[0] ?? ($validated['image'] ?? null);

        return $validated;
    }

    private function generateUniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'produk';
        $slug = $base;
        $counter = 2;

        while (
            Product::query()
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
