<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SliderController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Sliders/Index', [
            'sliders' => Slider::query()
                ->when($request->search, fn ($query, $search) => $query->where('title', 'like', "%{$search}%"))
                ->orderBy('order')
                ->orderBy('title')
                ->paginate(15)
                ->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Slider::create($this->validatedData($request));

        return back()->with('success', 'Slider berhasil ditambahkan.');
    }

    public function update(Request $request, Slider $slider): RedirectResponse
    {
        $slider->update($this->validatedData($request));

        return back()->with('success', 'Slider berhasil diperbarui.');
    }

    public function destroy(Slider $slider): RedirectResponse
    {
        $slider->delete();

        return back()->with('success', 'Slider berhasil dihapus.');
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'subtitle' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'string', 'max:500'],
            'badge' => ['nullable', 'string', 'max:80'],
            'cta_text' => ['nullable', 'string', 'max:80'],
            'cta_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);
    }
}
