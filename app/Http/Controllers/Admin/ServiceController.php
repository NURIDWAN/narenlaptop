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
    public function index(): Response
    {
        return Inertia::render('Admin/Services/Index', [
            'services' => Service::query()
                ->orderBy('order')
                ->orderBy('title')
                ->paginate(20),
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
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
    }
}
