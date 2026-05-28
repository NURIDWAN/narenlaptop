<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Media;
use App\Models\Product;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Slider;
use App\Models\TeamMember;
use App\Models\Testimonial;
use Illuminate\Support\Arr;

class PageSectionDataResolver
{
    public function resolve(iterable $sections): array
    {
        return collect($sections)
            ->map(function ($section) {
                $payload = is_array($section) ? $section : $section->toArray();
                $payload['data'] = $this->dataFor(
                    (string) Arr::get($payload, 'type', ''),
                    Arr::get($payload, 'settings', []) ?: [],
                );

                return $payload;
            })
            ->all();
    }

    public function dataFor(string $type, array $settings): array
    {
        if (Arr::get($settings, 'source', 'manual') !== 'database') {
            return [];
        }

        return match ($type) {
            'slider' => $this->sliders($settings),
            'blog_list' => $this->articles($settings),
            'gallery' => $this->media($settings),
            'services' => $this->services($settings),
            'products' => $this->products($settings),
            'testimonials' => $this->testimonials($settings),
            'team' => $this->teamMembers($settings),
            'contact', 'cta' => $this->contactSettings(),
            default => [],
        };
    }

    private function testimonials(array $settings): array
    {
        $limit = $this->limit(Arr::get($settings, 'limit', 6), 1, 24);

        return [
            'items' => Testimonial::active()->take($limit)->get()->map(fn ($t) => [
                'name' => $t->name,
                'role' => $t->role,
                'content' => $t->content,
                'rating' => $t->rating,
                'photo' => $t->photo,
            ])->all(),
        ];
    }

    private function sliders(array $settings): array
    {
        $limit = $this->limit(Arr::get($settings, 'limit', 5), 1, 12);

        $slides = Slider::active()
            ->take($limit)
            ->get(['id', 'title', 'subtitle', 'image', 'images', 'badge', 'cta_text', 'cta_url'])
            ->flatMap(function (Slider $slider) {
                $images = collect($slider->images ?? [])
                    ->filter()
                    ->values()
                    ->all();

                if (empty($images) && $slider->image) {
                    $images = [$slider->image];
                }

                return collect($images)->map(fn (string $image, int $index) => [
                    'id' => $slider->id.'-'.$index,
                    'title' => $slider->title,
                    'subtitle' => $slider->subtitle,
                    'image' => $image,
                    'badge' => $slider->badge,
                    'cta_text' => $slider->cta_text,
                    'cta_url' => $slider->cta_url,
                ]);
            })
            ->values()
            ->all();

        return [
            'slides' => $slides,
        ];
    }

    private function teamMembers(array $settings): array
    {
        $limit = $this->limit(Arr::get($settings, 'limit', 12), 1, 24);

        return [
            'members' => TeamMember::active()->take($limit)->get()->map(fn ($m) => [
                'name' => $m->name,
                'role' => $m->role,
                'photo' => $m->photo,
            ])->all(),
        ];
    }

    private function articles(array $settings): array
    {
        $limit = $this->limit(Arr::get($settings, 'limit', 3), 1, 12);

        return [
            'articles' => Article::query()
                ->published()
                ->latest('published_at')
                ->take($limit)
                ->get(['id', 'title', 'slug', 'excerpt', 'thumbnail', 'reading_time', 'published_at'])
                ->toArray(),
        ];
    }

    private function media(array $settings): array
    {
        $limit = $this->limit(Arr::get($settings, 'limit', 6), 1, 24);

        return [
            'images' => Media::query()
                ->where('mime_type', 'like', 'image/%')
                ->latest()
                ->take($limit)
                ->get()
                ->map(fn (Media $media) => [
                    'id' => $media->id,
                    'url' => $media->url,
                    'caption' => $media->alt ?: $media->filename,
                ])->all(),
        ];
    }

    private function services(array $settings): array
    {
        $limit = $this->limit(Arr::get($settings, 'limit', 6), 1, 24);

        return [
            'items' => Service::active()
                ->take($limit)
                ->get(['id', 'title', 'description', 'icon', 'image', 'cta_text', 'cta_url'])
                ->map(fn (Service $service) => [
                    'id' => $service->id,
                    'title' => $service->title,
                    'description' => $service->description,
                    'icon' => $service->icon,
                    'image' => $service->image,
                    'cta_text' => $service->cta_text,
                    'cta_url' => $service->cta_url,
                ])
                ->all(),
        ];
    }

    private function products(array $settings): array
    {
        $limit = $this->limit(Arr::get($settings, 'limit', 8), 1, 24);
        $categoryId = (int) Arr::get($settings, 'category_id');

        return [
            'items' => Product::active()
                ->when($categoryId > 0, fn ($query) => $query->where('category_id', $categoryId))
                ->take($limit)
                ->get(['id', 'name', 'slug', 'description', 'price', 'discount_price', 'badge', 'image', 'images', 'cta_url'])
                ->map(function (Product $product) {
                    $images = collect($product->images ?? [])->filter()->values()->all();

                    if (empty($images) && $product->image) {
                        $images = [$product->image];
                    }

                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'description' => $product->description,
                        'price' => $product->price,
                        'discount_price' => $product->discount_price,
                        'badge' => $product->badge,
                        'image' => $images[0] ?? null,
                        'images' => $images,
                        'cta_url' => $product->cta_url,
                    ];
                })
                ->all(),
        ];
    }

    private function contactSettings(): array
    {
        $settings = Setting::query()
            ->whereIn('key', ['whatsapp_number', 'whatsapp_message_default', 'email', 'address', 'google_maps_embed'])
            ->pluck('value', 'key')
            ->all();

        $phone = preg_replace('/\D+/', '', $settings['whatsapp_number'] ?? '');
        $message = (string) ($settings['whatsapp_message_default'] ?? '');

        return [
            'settings' => $settings,
            'whatsapp_url' => $phone ? 'https://wa.me/'.$phone.($message !== '' ? '?text='.rawurlencode($message) : '') : null,
        ];
    }

    private function limit(mixed $value, int $min, int $max): int
    {
        return min(max((int) $value, $min), $max);
    }
}
