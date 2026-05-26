<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArticleCategory;
use App\Models\Media;
use App\Models\Page;
use App\Models\Product;
use App\Models\Service;
use App\Models\Slider;
use App\Services\PageBuilderService;
use App\Services\PageSectionDataResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $pages = Page::query()
            ->withCount('sections')
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->sort, function ($q) use ($request) {
                $dir = $request->direction === 'asc' ? 'asc' : 'desc';
                $q->orderBy($request->sort, $dir);
            }, fn ($q) => $q->latest())
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
            'filters' => $request->only('search', 'status', 'sort', 'direction'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Builder', [
            'page' => [
                'title' => '',
                'slug' => '',
                'status' => 'draft',
                'meta_title' => '',
                'meta_description' => '',
                'meta_og_image' => '',
                'sections' => [],
            ],
            'sectionTypes' => PageBuilderService::SECTION_TYPES,
            'builderData' => $this->builderData(),
        ]);
    }

    public function store(Request $request, PageBuilderService $pageBuilder): RedirectResponse
    {
        $data = $this->validatedData($request);
        $sections = $data['sections'] ?? [];
        unset($data['sections']);

        $page = Page::create($data);
        $pageBuilder->syncSections($page, $sections);

        return to_route('admin.pages.edit', $page)->with('success', 'Halaman berhasil dibuat.');
    }

    public function show(Page $page, PageSectionDataResolver $sectionData): Response
    {
        $page->load('sections');

        return Inertia::render('Frontend/Page', [
            'page' => $page,
            'sections' => $sectionData->resolve($page->sections),
            'seo' => $this->seoForPage($page),
            'preview' => true,
        ]);
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Builder', [
            'page' => $page->load('sections'),
            'sectionTypes' => PageBuilderService::SECTION_TYPES,
            'builderData' => $this->builderData(),
        ]);
    }

    public function update(Request $request, Page $page, PageBuilderService $pageBuilder): RedirectResponse
    {
        $data = $this->validatedData($request, $page);
        $sections = $data['sections'] ?? [];
        unset($data['sections']);

        $page->update($data);
        $pageBuilder->syncSections($page, $sections);

        return back()->with('success', 'Halaman berhasil disimpan.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return to_route('admin.pages.index')->with('success', 'Halaman dihapus.');
    }

    private function validatedData(Request $request, ?Page $page = null): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'slug' => ['nullable', 'string', 'max:180', 'unique:pages,slug,'.($page?->id ?? 'NULL')],
            'status' => ['required', 'in:draft,published'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_og_image' => ['nullable', 'string', 'max:500'],
            'sections' => ['array'],
            'sections.*.id' => ['nullable', 'integer'],
            'sections.*.type' => ['required', 'string'],
            'sections.*.settings' => ['nullable', 'array'],
            'sections.*.is_visible' => ['boolean'],
        ]);

        $validated['slug'] = $validated['slug'] ?: Str::slug($validated['title']);

        return $validated;
    }

    private function seoForPage(Page $page): array
    {
        return [
            'title' => $page->meta_title ?: $page->title,
            'description' => $page->meta_description,
            'og_image' => $page->meta_og_image,
        ];
    }

    private function builderData(): array
    {
        return [
            'articleCategories' => ArticleCategory::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'media' => Media::query()
                ->where('mime_type', 'like', 'image/%')
                ->latest()
                ->take(100)
                ->get()
                ->map(fn (Media $media) => [
                    'id' => $media->id,
                    'filename' => $media->filename,
                    'url' => $media->url,
                    'alt' => $media->alt,
                ]),
            'services' => Service::query()
                ->orderBy('order')
                ->orderBy('title')
                ->get(['id', 'title', 'is_active']),
            'products' => Product::query()
                ->orderBy('order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'is_active']),
            'sliders' => Slider::query()
                ->orderBy('order')
                ->orderBy('title')
                ->get(['id', 'title', 'is_active']),
        ];
    }
}
