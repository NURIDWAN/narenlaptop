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
                ->with('subServices')
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
        $data = $this->validatedData($request);
        $subServices = $data['sub_services'] ?? [];
        unset($data['sub_services']);

        $service = Service::create($data);
        $this->syncSubServices($service, $subServices);

        return back()->with('success', 'Layanan berhasil ditambahkan.');
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $data = $this->validatedData($request);
        $subServices = $data['sub_services'] ?? [];
        unset($data['sub_services']);

        $service->update($data);
        $this->syncSubServices($service, $subServices);

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
            'description' => ['nullable', 'string', 'max:20000'],
            'icon' => ['nullable', 'string', 'max:80'],
            'image' => ['nullable', 'string', 'max:255'],
            'cta_text' => ['nullable', 'string', 'max:80'],
            'cta_url' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'sub_services' => ['array'],
            'sub_services.*.id' => ['nullable', 'integer'],
            'sub_services.*.name' => ['required', 'string', 'max:180'],
            'sub_services.*.description' => ['nullable', 'string', 'max:20000'],
            'sub_services.*.image' => ['nullable', 'string', 'max:255'],
            'sub_services.*.order' => ['nullable', 'integer', 'min:0'],
            'sub_services.*.is_active' => ['boolean'],
        ]);
    }

    private function syncSubServices(Service $service, array $subServices): void
    {
        $existingIds = $service->subServices()->pluck('id')->all();
        $incomingIds = collect($subServices)->pluck('id')->filter()->map(fn ($id) => (int) $id)->all();

        $service->subServices()->whereIn('id', array_diff($existingIds, $incomingIds))->delete();

        foreach (array_values($subServices) as $index => $subService) {
            $payload = [
                'name' => $subService['name'],
                'description' => $subService['description'] ?? null,
                'image' => $subService['image'] ?? null,
                'order' => $subService['order'] ?? $index,
                'is_active' => (bool) ($subService['is_active'] ?? true),
            ];

            $subServiceId = ! empty($subService['id']) ? (int) $subService['id'] : null;

            if ($subServiceId && in_array($subServiceId, $existingIds, true)) {
                $service->subServices()->whereKey($subServiceId)->update($payload);
                continue;
            }

            $service->subServices()->create($payload);
        }
    }
}
