<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Page;
use App\Services\PageSectionDataResolver;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(private PageSectionDataResolver $sectionData)
    {
    }

    public function home(): Response
    {
        $page = Page::query()->published()->where('slug', 'beranda')->first();

        if (! $page) {
            return Inertia::render('Frontend/Page', [
                'page' => ['title' => 'Beranda'],
                'sections' => [[
                    'id' => 'fallback-hero',
                    'type' => 'hero',
                    'settings' => [
                        'title' => 'Service Laptop dan Gadget',
                        'subtitle' => 'Website company profile Laravel, Inertia, dan React siap dikembangkan dari Page Builder.',
                        'cta_text' => 'Login Admin',
                        'cta_url' => '/login',
                    ],
                ]],
                'latestArticles' => [],
                'seo' => [
                    'title' => config('app.name'),
                    'description' => 'Company profile service laptop dan gadget.',
                ],
            ]);
        }

        return $this->show($page->slug);
    }

    public function show(string $slug): Response
    {
        $page = Page::query()
            ->published()
            ->where('slug', $slug)
            ->with('visibleSections')
            ->firstOrFail();

        return Inertia::render('Frontend/Page', [
            'page' => $page,
            'sections' => $this->sectionData->resolve($page->visibleSections),
            'latestArticles' => Article::query()->published()->latest('published_at')->take(3)->get(),
            'seo' => [
                'title' => $page->meta_title ?: $page->title,
                'description' => $page->meta_description,
                'og_image' => $page->meta_og_image,
            ],
        ]);
    }
}
