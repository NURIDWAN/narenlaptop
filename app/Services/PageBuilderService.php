<?php

namespace App\Services;

use App\Models\Page;
use Illuminate\Support\Arr;

class PageBuilderService
{
    public const SECTION_TYPES = [
        'slider',
        'about_hero',
        'hero',
        'about',
        'journey',
        'values',
        'expertise',
        'services',
        'products',
        'booking_service',
        'stats',
        'testimonials',
        'gallery',
        'image_compare',
        'cta',
        'faq',
        'contact',
        'blog_list',
        'rich_text',
        'custom_html',
        'pricing',
        'team',
    ];

    public function syncSections(Page $page, array $sections): void
    {
        $existingIds = $page->sections()->pluck('id')->all();
        $incomingIds = collect($sections)->pluck('id')->filter()->all();

        $page->sections()->whereIn('id', array_diff($existingIds, $incomingIds))->delete();

        foreach (array_values($sections) as $index => $section) {
            $page->sections()->updateOrCreate(
                ['id' => Arr::get($section, 'id')],
                [
                    'type' => Arr::get($section, 'type', 'hero'),
                    'order' => $index,
                    'settings' => Arr::get($section, 'settings', []),
                    'is_visible' => (bool) Arr::get($section, 'is_visible', true),
                ],
            );
        }
    }
}
