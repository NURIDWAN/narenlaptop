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
                    'title' => config('app.name').' - Service Laptop & Gadget Terpercaya',
                    'description' => 'Layanan service laptop, gadget, dan solusi IT profesional dengan teknisi berpengalaman. Konsultasi gratis.',
                    'keywords' => 'service laptop, service gadget, perbaikan laptop, solusi IT, komputer',
                    'canonical' => url('/'),
                    'og_type' => 'website',
                ],
                'breadcrumbs' => [['name' => 'Home', 'url' => url('/')]],
            ]);
        }

        return $this->renderPage($page, true);
    }

    public function show(string $slug): Response
    {
        $page = Page::query()
            ->published()
            ->where('slug', $slug)
            ->with('visibleSections')
            ->firstOrFail();

        return $this->renderPage($page, false);
    }

    private function renderPage(Page $page, bool $isHome): Response
    {
        $page->loadMissing('visibleSections');
        $url = $isHome ? url('/') : url('/'.$page->slug);

        return Inertia::render('Frontend/Page', [
            'page' => $page,
            'sections' => $this->sectionData->resolve($page->visibleSections),
            'latestArticles' => Article::query()->published()->latest('published_at')->take(3)->get(),
            'seo' => [
                'title' => $page->meta_title ?: ($isHome ? config('app.name').' - Service Laptop & Gadget Terpercaya' : $page->title),
                'description' => $page->meta_description ?: ($isHome ? 'Layanan service laptop, gadget, dan solusi IT profesional. Konsultasi gratis dan pengerjaan cepat.' : 'Halaman '.$page->title.' - '.config('app.name')),
                'keywords' => $isHome ? 'service laptop, service gadget, perbaikan laptop, solusi IT, komputer' : '',
                'og_image' => $page->meta_og_image,
                'canonical' => $url,
                'og_type' => 'website',
            ],
            'breadcrumbs' => $isHome
                ? [['name' => 'Home', 'url' => url('/')]]
                : [['name' => 'Home', 'url' => url('/')], ['name' => $page->title, 'url' => $url]],
        ]);
    }
}
