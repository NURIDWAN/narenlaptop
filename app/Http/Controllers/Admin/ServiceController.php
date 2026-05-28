<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $sortable = ['title', 'order', 'is_active'];
        $sort = in_array($request->string('sort')->toString(), $sortable, true)
            ? $request->string('sort')->toString()
            : null;
        $direction = $request->string('direction')->toString() === 'desc' ? 'desc' : 'asc';

        return Inertia::render('Admin/Services/Index', [
            'services' => Service::query()
                ->when($request->search, fn ($query, $search) => $query
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%"))
                ->when($request->has('active') && $request->active !== '', fn ($query) => $query->where('is_active', $request->boolean('active')))
                ->when($sort, fn ($query) => $query->orderBy($sort, $direction), fn ($query) => $query->orderBy('order')->orderBy('title'))
                ->paginate(20)
                ->withQueryString(),
            'filters' => $request->only('search', 'active', 'sort', 'direction'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Service::create($this->validatedData($request));

        return back()->with('success', 'Layanan berhasil ditambahkan.');
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $service->update($this->validatedData($request));

        return back()->with('success', 'Layanan berhasil diperbarui.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        return back()->with('success', 'Layanan berhasil dihapus.');
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:80'],
            'image' => ['nullable', 'string', 'max:255'],
            'cta_text' => ['nullable', 'string', 'max:80'],
            'cta_url' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
    }
}
