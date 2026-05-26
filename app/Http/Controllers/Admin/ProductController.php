<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        Product::create($this->validatedData($request));

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $product->update($this->validatedData($request));

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    private function validatedData(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:20000'],
            'price' => ['nullable', 'string', 'max:120'],
            'discount_price' => ['nullable', 'string', 'max:120'],
            'badge' => ['nullable', 'string', 'max:80'],
            'image' => ['nullable', 'string', 'max:500'],
            'cta_url' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

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
            $validated['image'] = $media->url;
        }

        return $validated;
    }
}
