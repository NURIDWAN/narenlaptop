<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    public function index(Request $request): Response
    {
        $testimonials = Testimonial::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('content', 'like', "%{$s}%"))
            ->when($request->has('active'), fn ($q) => $q->where('is_active', $request->boolean('active')))
            ->when($request->sort, function ($q) use ($request) {
                $q->orderBy($request->sort, $request->direction === 'asc' ? 'asc' : 'desc');
            }, fn ($q) => $q->orderBy('order'))
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials' => $testimonials,
            'filters' => $request->only('search', 'active', 'sort', 'direction'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Testimonial::create($this->validated($request));

        return back()->with('success', 'Testimoni ditambahkan.');
    }

    public function update(Request $request, Testimonial $testimonial): RedirectResponse
    {
        $testimonial->update($this->validated($request));

        return back()->with('success', 'Testimoni diperbarui.');
    }

    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        $testimonial->delete();

        return back()->with('success', 'Testimoni dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'role' => ['nullable', 'string', 'max:100'],
            'content' => ['required', 'string', 'max:1000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'photo' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'order' => ['integer'],
        ]);
    }
}
